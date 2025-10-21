pipeline {
    agent any

    environment {
        // 🔐 Credenciales y configuración
        SONAR_TOKEN        = credentials('SONAR_TOKEN')
        SONAR_PROJECT_KEY  = 'KasandraChumpitazChipana_PRSG8'
        SONAR_ORG          = 'KasandraChumpitazChipana'
        SONAR_HOST_URL     = 'https://sonarcloud.io'

        // ⚙️ Configuración dinámica
        PROJECT_NAME       = 'ms_water_quality'
        BUILD_DATE         = sh(returnStdout: true, script: 'date +%Y%m%d_%H%M%S').trim()
        BRANCH_NAME        = sh(returnStdout: true, script: 'git rev-parse --abbrev-ref HEAD').trim()
    }

    tools {
        jdk 'jdk17'
        maven 'Maven3'
    }

    stages {

        stage('Checkout') {
            steps {
                echo "📦 Clonando el repositorio (${BRANCH_NAME})..."
                checkout scm
            }
        }

        stage('Build & Test') {
            parallel {
                stage('Build') {
                    steps {
                        echo '⚙️ Compilando el proyecto con Maven...'
                        sh 'mvn -B clean compile'
                    }
                }

                stage('Unit Tests') {
                    steps {
                        echo '🧪 Ejecutando pruebas unitarias...'
                        sh 'mvn test'
                    }
                    post {
                        always {
                            junit '**/target/surefire-reports/*.xml'
                        }
                    }
                }
            }
        }

        stage('SonarCloud Analysis') {
            when { expression { env.BRANCH_NAME != 'main' || env.BRANCH_NAME != 'master' } }
            steps {
                echo '🔍 Ejecutando análisis en SonarCloud...'
                withSonarQubeEnv('SonarCloud') {
                    sh """
                        mvn sonar:sonar \
                            -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                            -Dsonar.organization=${SONAR_ORG} \
                            -Dsonar.host.url=${SONAR_HOST_URL} \
                            -Dsonar.token=${SONAR_TOKEN}
                    """
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    script {
                        def qualityGate = waitForQualityGate()
                        if (qualityGate.status != 'OK') {
                            error "🚫 Falló la verificación del Quality Gate: ${qualityGate.status}"
                        }
                    }
                }
            }
        }

        stage('Package') {
            when {
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                echo "📦 Empaquetando el artefacto final (${PROJECT_NAME}-${BUILD_DATE}.jar)..."
                sh "mvn clean package -DskipTests"
                sh "mv target/*.jar target/${PROJECT_NAME}-${BUILD_DATE}.jar"

                echo '📂 Archivos generados en target/:'
                sh 'ls -l target'
            }
        }

        stage('Archive Artifact') {
            steps {
                echo '💾 Archivando el archivo JAR generado...'
                archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline completado exitosamente en la rama ${BRANCH_NAME}"
            echo "📁 Artefacto generado: target/${PROJECT_NAME}-${BUILD_DATE}.jar"
        }
        unstable {
            echo '⚠️ Pipeline inestable (revisa los tests o el análisis de calidad).'
        }
        failure {
            echo '❌ Falló la ejecución del pipeline.'
        }
        always {
            echo "🕒 Pipeline finalizado: ${BUILD_DATE}"
        }
    }
}
