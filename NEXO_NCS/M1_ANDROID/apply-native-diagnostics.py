#!/usr/bin/env python3
"""Apply and verify diagnostics against the exact pinned llama.cpp Android source."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
UPSTREAM = ROOT / "llama.cpp" / "examples" / "llama.android" / "lib" / "src" / "main"
CPP = UPSTREAM / "cpp" / "ai_chat.cpp"
HEADER = UPSTREAM / "cpp" / "logging.h"
KOTLIN = UPSTREAM / "java" / "com" / "arm" / "aichat" / "internal" / "InferenceEngineImpl.kt"

def replace_once(path: Path, old: str, new: str) -> None:
    data = path.read_text(encoding="utf-8")
    count = data.count(old)
    if count != 1:
        raise SystemExit(f"FAIL: expected exactly one anchor in {path.name}, found {count}")
    path.write_text(data.replace(old, new, 1), encoding="utf-8")

header_old = '#include <android/log.h>\n'
header_new = '''#include <android/log.h>
#include <algorithm>
#include <mutex>
#include <string>

static std::mutex aichat_error_mutex;
static std::string aichat_last_error_text;

static inline void aichat_clear_last_error() {
    std::lock_guard<std::mutex> lock(aichat_error_mutex);
    aichat_last_error_text.clear();
}

static inline std::string aichat_get_last_error() {
    std::lock_guard<std::mutex> lock(aichat_error_mutex);
    return aichat_last_error_text;
}
'''
replace_once(HEADER, header_old, header_new)

callback_old = '''    const int prio = android_log_prio_from_ggml(level);
    if (!ai_should_log(prio)) return;
    __android_log_write(prio, LOG_TAG, text);
'''
callback_new = '''    const int prio = android_log_prio_from_ggml(level);
    // Preserve only bounded native ERROR diagnostics for the UI, even if Android log filtering hides them.
    if (level == GGML_LOG_LEVEL_ERROR && text != nullptr) {
        std::lock_guard<std::mutex> lock(aichat_error_mutex);
        aichat_last_error_text.assign(text, std::min<std::size_t>(std::char_traits<char>::length(text), 512));
    }
    if (!ai_should_log(prio)) return;
    __android_log_write(prio, LOG_TAG, text);
'''
replace_once(HEADER, callback_old, callback_new)

load_old = '''Java_com_arm_aichat_internal_InferenceEngineImpl_load(JNIEnv *env, jobject, jstring jmodel_path) {
    llama_model_params model_params = llama_model_default_params();
'''
load_new = '''Java_com_arm_aichat_internal_InferenceEngineImpl_load(JNIEnv *env, jobject, jstring jmodel_path) {
    aichat_clear_last_error();
    // Backend loading/initialization belongs to the upstream init(nativeLibDir) lifecycle.
    llama_model_params model_params = llama_model_default_params();
'''
replace_once(CPP, load_old, load_new)

jni_anchor = '''extern "C"
JNIEXPORT jint JNICALL
Java_com_arm_aichat_internal_InferenceEngineImpl_prepare(JNIEnv * /*env*/, jobject /*unused*/) {
'''
jni_new = '''extern "C"
JNIEXPORT jstring JNICALL
Java_com_arm_aichat_internal_InferenceEngineImpl_lastError(JNIEnv *env, jobject /*unused*/) {
    const auto message = aichat_get_last_error();
    return env->NewStringUTF(message.c_str());
}

extern "C"
JNIEXPORT jint JNICALL
Java_com_arm_aichat_internal_InferenceEngineImpl_prepare(JNIEnv * /*env*/, jobject /*unused*/) {
'''
replace_once(CPP, jni_anchor, jni_new)

kotlin_old = '''    @FastNative
    private external fun load(modelPath: String): Int

    @FastNative
    private external fun prepare(): Int
'''
kotlin_new = '''    @FastNative
    private external fun load(modelPath: String): Int

    @FastNative
    private external fun lastError(): String

    @FastNative
    private external fun prepare(): Int
'''
replace_once(KOTLIN, kotlin_old, kotlin_new)

load_error_old = '''                    // TODO-han.yin: find a better way to pass other error codes
                    if (it != 0) throw UnsupportedArchitectureException()
'''
load_error_new = '''                    if (it != 0) {
                        val nativeDetail = lastError().trim().take(512)
                        throw IOException(
                            if (nativeDetail.isNotBlank()) "Native model load failed: $nativeDetail"
                            else "Native model load failed without a native error message"
                        )
                    }
'''
replace_once(KOTLIN, load_error_old, load_error_new)

# Fail closed if the diagnostic API or bounded capture was not applied.
checks = [
    (HEADER, "aichat_last_error_text.assign"),
    (CPP, "Java_com_arm_aichat_internal_InferenceEngineImpl_lastError"),
    (KOTLIN, "private external fun lastError(): String"),
    (KOTLIN, "Native model load failed"),
]
for path, needle in checks:
    if needle not in path.read_text(encoding="utf-8"):
        raise SystemExit(f"FAIL: post-patch assertion missing {needle} in {path}")
print("PASS: native error capture, JNI bridge, Kotlin propagation, and post-patch assertions")
