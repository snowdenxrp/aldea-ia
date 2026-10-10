plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "org.nexo.m1"
    compileSdk = 36

    defaultConfig {
        applicationId = "org.nexo.m1"
        minSdk = 33
        targetSdk = 36
        versionCode = 1
        versionName = "0.2.0-prototype"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlin {
        compilerOptions {
            jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
        }
    }

    buildTypes {
        debug {
            isMinifyEnabled = false
        }
        release {
            isMinifyEnabled = false
        }
    }

dependencies {
    implementation(project(":llama-lib"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")
}
