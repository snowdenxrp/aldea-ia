package org.nexo.m1

import android.app.Activity
import android.graphics.Typeface
import android.os.Bundle
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView

/**
 * M1 Stage 1 shell only.
 *
 * This deliberately does not persist prompts, invoke Nexo's simulation runtime, access
 * credentials, call tools, or pretend to perform local inference. The inference adapter
 * will be integrated only after its native dependencies and model-provisioning boundary
 * are pinned and reviewed.
 */
class MainActivity : Activity() {
    private lateinit var status: TextView
    private lateinit var prompt: EditText
    private lateinit var output: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        title = "Nexo M1"

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
            text = "PROTOTIPO · inferencia local todavía no integrada"
            textSize = 14f
            setPadding(0, dp(10), 0, dp(18))
        }
        root.addView(status)

        prompt = EditText(this).apply {
            hint = "Escribe una pregunta de prueba"
            minLines = 2
            maxLines = 5
            gravity = android.view.Gravity.TOP or android.view.Gravity.START
            setSingleLine(false)
        }
        root.addView(prompt, LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ))

        val send = Button(this).apply {
            text = "Probar prototipo"
            setOnClickListener {
                // Fail closed: never simulate a model response.
                output.text = "No disponible: el motor y el modelo local aún no están integrados. " +
                    "No se envió la pregunta a ningún proveedor remoto."
                status.text = "SIN MOTOR LOCAL · sin respuesta generada"
            }
        }
        root.addView(send)

        val scroll = ScrollView(this)
        output = TextView(this).apply {
            text = "Las preguntas y respuestas no se guardan en un historial. " +
                "Esta fase solo verifica el límite de interfaz."
            textSize = 16f
            setPadding(0, dp(18), 0, dp(8))
        }
        scroll.addView(output)
        root.addView(scroll, LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f
        ))

        setContentView(root)
    }

    private fun dp(value: Int): Int =
        (value * resources.displayMetrics.density).toInt()
}
