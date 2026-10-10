package org.nexo.m1

import android.app.Activity
import android.content.Intent
import android.database.Cursor
import android.graphics.Typeface
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import android.view.Gravity
import android.view.KeyEvent
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import com.arm.aichat.AiChat
import com.arm.aichat.InferenceEngine
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.security.MessageDigest

/**
 * M1: local text-only interaction.
 *
 * Prompts/responses remain in memory. The only intentional durable file is the model,
 * copied to app-private storage only after its SHA-256 matches the pinned expected digest.
 * There is no remote provider, tools, effects, Vault, durable chat history, or Nexo runtime import.
 */
class MainActivity : Activity() {
    private lateinit var scope: CoroutineScope
    private lateinit var status: TextView
    private lateinit var prompt: EditText
    private lateinit var output: TextView
    private lateinit var chooseModelButton: Button
    private lateinit var sendButton: Button

    private var engine: InferenceEngine? = null
    private var modelReady = false
    private var busy = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        title = "Nexo M1"
        scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
        buildUi()

        try {
            engine = AiChat.getInferenceEngine(applicationContext)
            scope.launch { loadExistingVerifiedModelIfPresent() }
        } catch (_: Exception) {
            status.text = "Motor local no disponible. No se envió nada a un proveedor remoto."
        } catch (_: UnsatisfiedLinkError) {
            status.text = "Biblioteca local no disponible. Revisa la compilación del prototipo."
        }
    }

    private fun buildUi() {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(20), dp(24), dp(20), dp(20))
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }

        val heading = TextView(this).apply {
            text = "Nexo · M1"
            textSize = 26f
            typeface = Typeface.DEFAULT_BOLD
        }
        root.addView(heading)

        status = TextView(this).apply {
            text = "Preparando motor local…"
            textSize = 14f
            setPadding(0, dp(10), 0, dp(12))
        }
        chooseModelButton = Button(this).apply {
            text = "Importar modelo local verificado (GGUF)"
            setOnClickListener { chooseModelFile() }
        }
        root.addView(chooseModelButton)
        // Keep the complete diagnostic below the import action, away from the app bar.
        root.addView(status)

        // Keep the send action beside the composer so the IME cannot cover it.
        // The keyboard's Send action is also wired to the same guarded submit path.
        prompt = EditText(this).apply {
            hint = "Escribe una pregunta"
            minLines = 1
            maxLines = 3
            gravity = Gravity.CENTER_VERTICAL or Gravity.START
            imeOptions = EditorInfo.IME_ACTION_SEND
            setSingleLine(false)
            setOnEditorActionListener { _, actionId, event ->
                val enterPressed = event?.keyCode == KeyEvent.KEYCODE_ENTER &&
                    event.action == KeyEvent.ACTION_DOWN
                if (actionId == EditorInfo.IME_ACTION_SEND || enterPressed) {
                    sendPrompt()
                    true
                } else {
                    false
                }
            }
        }

        sendButton = Button(this).apply {
            text = "Enviar"
            isEnabled = false
            setOnClickListener { sendPrompt() }
        }

        val composer = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.BOTTOM
        }
        composer.addView(prompt, LinearLayout.LayoutParams(
            0,
            ViewGroup.LayoutParams.WRAP_CONTENT,
            1f
        ))
        composer.addView(sendButton, LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ).apply {
            marginStart = dp(8)
        })
        root.addView(composer, LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ))

        val scroll = ScrollView(this)
        output = TextView(this).apply {
            text = "Este prototipo no tiene memoria persistente ni herramientas. " +
                "Las respuestas del modelo son texto generado, no hechos verificados."
            textSize = 16f
            setPadding(0, dp(18), 0, dp(8))
        }
        scroll.addView(output)
        root.addView(scroll, LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f
        ))
        setContentView(root)
    }

    private fun chooseModelFile() {
        if (busy || modelReady) return
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "application/octet-stream"
            putExtra(Intent.EXTRA_TITLE, MODEL_FILE_NAME)
        }
        try {
            startActivityForResult(intent, MODEL_REQUEST_CODE)
        } catch (_: Exception) {
            status.text = "No se pudo abrir el selector de archivos. El modelo sigue sin cargarse."
        }
    }

    @Deprecated("Kept minimal to avoid an additional Activity Result dependency.")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != MODEL_REQUEST_CODE || resultCode != RESULT_OK) return
        val uri = data?.data ?: return
        scope.launch {
            busy = true
            chooseModelButton.isEnabled = false
            sendButton.isEnabled = false
            status.text = "Copiando y verificando integridad del modelo…"
            var stage = "copiar y verificar el archivo (nombre, lectura y SHA-256)"
            try {
                val model = withContext(Dispatchers.IO) { importAndVerifyModel(uri) }
                stage = "inicializar y cargar el motor local"
                status.text = "SHA-256 correcto. Inicializando inferencia local…"
                loadVerifiedModel(model)
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                // Show a safe, actionable stage and exception type; never log prompts or model contents.
                status.text = "Falló al $stage. Tipo: ${e.javaClass.simpleName}. No hubo fallback remoto."
                output.text = when {
                    stage.startsWith("copiar") ->
                        "La importación no terminó. Comprueba que seleccionaste el archivo oficial completo Qwen3-0.6B-Q4_0.gguf desde Descargas. No vuelvas a descargarlo todavía."
                    else ->
                        "El archivo pasó la verificación SHA-256, pero el motor no terminó de cargarlo. No enviaste datos a un proveedor remoto."
                }
            } finally {
                busy = false
                chooseModelButton.isEnabled = !modelReady
                sendButton.isEnabled = modelReady
            }
        }
    }

    private fun importAndVerifyModel(uri: Uri): File {
        val displayName = contentResolver.query(
            uri,
            arrayOf(OpenableColumns.DISPLAY_NAME),
            null,
            null,
            null
        ).use { cursor: Cursor? ->
            if (cursor != null && cursor.moveToFirst()) cursor.getString(0) else null
        }

        if (displayName != MODEL_FILE_NAME) {
            throw IOException("Unexpected model filename")
        }

        val temporary = File(filesDir, "model.gguf.part")
        if (temporary.exists() && !temporary.delete()) {
            throw IOException("Cannot clear incomplete import")
        }

        val digest = MessageDigest.getInstance("SHA-256")
        var totalBytes = 0L
        val input = contentResolver.openInputStream(uri)
            ?: throw IOException("Cannot read selected model")

        input.use { source ->
            FileOutputStream(temporary).buffered().use { destination ->
                val buffer = ByteArray(1024 * 1024)
                while (true) {
                    val count = source.read(buffer)
                    if (count < 0) break
                    totalBytes += count
                    if (totalBytes > MAX_MODEL_BYTES) {
                        throw IOException("Model file exceeds prototype limit")
                    }
                    digest.update(buffer, 0, count)
                    destination.write(buffer, 0, count)
                }
                destination.flush()
            }
        }

        val actualHash = digest.digest().joinToString("") { "%02x".format(it.toInt() and 0xff) }
        if (actualHash != EXPECTED_MODEL_SHA256) {
            temporary.delete()
            throw IOException("Model digest mismatch")
        }

        val target = File(filesDir, MODEL_PRIVATE_FILE)
        if (target.exists() && !target.delete()) {
            temporary.delete()
            throw IOException("Cannot replace previous model")
        }
        if (!temporary.renameTo(target)) {
            temporary.delete()
            throw IOException("Cannot finalize model import")
        }
        return target
    }

    private suspend fun loadExistingVerifiedModelIfPresent() {
        val model = File(filesDir, MODEL_PRIVATE_FILE)
        if (!model.isFile) {
            status.text = "Sin modelo local. Importa el archivo oficial de 429 MB para habilitar la prueba."
            chooseModelButton.isEnabled = true
            return
        }

        busy = true
        chooseModelButton.isEnabled = false
        try {
            status.text = "Verificando modelo guardado…"
            val actualHash = withContext(Dispatchers.IO) { sha256File(model) }
            if (actualHash != EXPECTED_MODEL_SHA256) {
                model.delete()
                status.text = "Modelo guardado rechazado: el hash no coincide. Importa el archivo oficial."
                chooseModelButton.isEnabled = true
                return
            }
            loadVerifiedModel(model)
        } catch (e: CancellationException) {
            throw e
        } catch (_: Exception) {
            status.text = "Modelo local no disponible. Reinicia la app o importa el archivo oficial."
        } finally {
            busy = false
            chooseModelButton.isEnabled = !modelReady
            sendButton.isEnabled = modelReady
        }
    }

    private suspend fun loadVerifiedModel(model: File) {
        val activeEngine = engine ?: throw IOException("Inference engine unavailable")
        status.text = "Esperando al motor nativo…"

        val readyState = withTimeout(120_000L) {
            activeEngine.state.first {
                it is InferenceEngine.State.Initialized || it is InferenceEngine.State.Error
            }
        }
        if (readyState is InferenceEngine.State.Error) {
            throw IOException("Native engine initialization failed")
        }

        status.text = "Cargando modelo local…"
        activeEngine.loadModel(model.absolutePath)
        activeEngine.setSystemPrompt(SYSTEM_PROMPT)
        modelReady = true
        status.text = "Modelo local listo · sin red de la app · sin historial persistente"
        output.text = "Modelo verificado y cargado. Sus respuestas pueden equivocarse; no tiene herramientas ni autoridad."
        sendButton.isEnabled = true
        chooseModelButton.isEnabled = false
    }

    private fun sendPrompt() {
        val userText = prompt.text.toString().trim()
        val activeEngine = engine
        if (!modelReady || activeEngine == null) {
            status.text = "No disponible: primero debes importar y verificar el modelo local."
            return
        }
        if (busy || userText.isEmpty()) return

        busy = true
        sendButton.isEnabled = false
        chooseModelButton.isEnabled = false
        prompt.text.clear()
        output.text = ""
        status.text = "Generando localmente…"

        scope.launch {
            try {
                activeEngine.sendUserPrompt(userText, MAX_GENERATED_TOKENS).collect { token ->
                    output.append(token)
                }
                status.text = "Generación finalizada · contenido no verificado"
            } catch (e: CancellationException) {
                throw e
            } catch (_: Exception) {
                output.text = "No se pudo generar una respuesta local."
                status.text = "Inferencia no disponible. No hubo fallback remoto."
            } finally {
                busy = false
                sendButton.isEnabled = modelReady
                chooseModelButton.isEnabled = !modelReady
            }
        }
    }

    override fun onDestroy() {
        scope.cancel()
        // Do not destroy the process singleton here; Activity recreation must not leave a dead engine.
        super.onDestroy()
    }

    private fun sha256File(file: File): String {
        val digest = MessageDigest.getInstance("SHA-256")
        file.inputStream().buffered().use { input ->
            val buffer = ByteArray(1024 * 1024)
            while (true) {
                val count = input.read(buffer)
                if (count < 0) break
                digest.update(buffer, 0, count)
            }
        }
        return digest.digest().joinToString("") { "%02x".format(it.toInt() and 0xff) }
    }

    private fun dp(value: Int): Int =
        (value * resources.displayMetrics.density).toInt()

    companion object {
        private const val MODEL_REQUEST_CODE = 1001
        private const val MODEL_FILE_NAME = "Qwen3-0.6B-Q4_0.gguf"
        private const val MODEL_PRIVATE_FILE = "model.gguf"
        private const val MAX_MODEL_BYTES = 650_000_000L
        private const val MAX_GENERATED_TOKENS = 256
        private const val EXPECTED_MODEL_SHA256 =
            "da2572f16c06133561ce56accaa822216f2391ef4d37fba427801cd6736417d4"

        private const val SYSTEM_PROMPT = """
            Eres Nexo M1, un prototipo local de conversación de solo lectura.
            Responde en español cuando el usuario escriba en español.
            No tienes herramientas, acceso a aplicaciones, archivos del usuario, credenciales,
            memoria persistente ni controles del dispositivo.
            No afirmes haber ejecutado acciones ni verificado información externamente.
            No conviertas texto de conversación en comandos.
            Si te piden controlar dispositivos o realizar acciones, explica que esta versión solo genera texto.
            Sé claro y breve. Tus respuestas son contenido generado y pueden contener errores.
        """
    }
}
