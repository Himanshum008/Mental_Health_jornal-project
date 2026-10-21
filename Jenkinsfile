pipeline {
    agent any

    parameters {
        booleanParam(
            name: 'DEMO_FAILING_TEST',
            defaultValue: false,
            description: 'Enable to demonstrate a controlled Quality Gate failure for lab evaluation (Phase 3 & 4)'
        )
        booleanParam(
            name: 'RUN_FULL_TRAINING',
            defaultValue: true,
            description: 'Run ML model training and evaluation stage'
        )
        booleanParam(
            name: 'BUILD_DOCKER_IMAGES',
            defaultValue: false,
            description: 'Build Docker container images during package stage (requires Docker daemon)'
        )
    }

    environment {
        PYTHONUNBUFFERED = '1'
        DEMO_FAILING_TEST = "${params.DEMO_FAILING_TEST}"
        ML_SERVICE_URL = 'http://localhost:8000'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '=== Stage 1: Checkout Source from Git Repository ==='
                checkout scm
                script {
                    if (isUnix()) {
                        sh 'git log -1 --stat'
                    } else {
                        bat 'git log -1 --stat'
                    }
                }
            }
        }

        stage('Build / Install') {
            steps {
                echo '=== Stage 2: Install Dependencies & Compile Services ==='
                script {
                    if (isUnix()) {
                        // Python dependencies
                        sh 'python3 -m pip install --upgrade pip'
                        sh 'python3 -m pip install -r app/requirements.txt'
                        // Java Spring Boot backend compile
                        dir('backend') {
                            sh 'mvn clean test-compile'
                        }
                        // React Frontend build
                        dir('frontend') {
                            sh 'npm ci || npm install'
                            sh 'npm run build'
                        }
                    } else {
                        // Windows agent
                        bat 'python -m pip install --upgrade pip'
                        bat 'python -m pip install -r app/requirements.txt'
                        dir('backend') {
                            bat 'mvn clean test-compile'
                        }
                        dir('frontend') {
                            bat 'npm install'
                            bat 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Test') {
            steps {
                echo '=== Stage 3: Automated ML, Backend & Frontend Test Suite ==='
                script {
                    if (isUnix()) {
                        // Run Pytest suite
                        sh 'python3 -m pytest app/tests -v --junitxml=pytest-results.xml'
                        // Run Backend JUnit tests
                        dir('backend') {
                            sh 'mvn test'
                        }
                    } else {
                        bat 'python -m pytest app/tests -v --junitxml=pytest-results.xml'
                        dir('backend') {
                            bat 'mvn test'
                        }
                    }
                }
            }
        }

        stage('Train & Evaluate') {
            when {
                expression { return params.RUN_FULL_TRAINING }
            }
            steps {
                echo '=== Stage 4: Train & Evaluate Candidate ML Model ==='
                script {
                    def trainCmd = 'python -c "import pandas as pd; from app.model_trainer import train_and_evaluate_model; df=pd.read_csv(\'storage/datasets/emotion_dataset.csv\'); pipe, metrics = train_and_evaluate_model(df, \'journal_text\', \'mood\'); print(\'Trained Model Evaluation:\', metrics[\'algorithm\'], \'Acc:\', metrics[\'accuracy\'], \'F1:\', metrics[\'f1_score\'])"'
                    if (isUnix()) {
                        sh trainCmd
                    } else {
                        bat trainCmd
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                echo '=== Stage 5: ML Quality Gate Validation ==='
                script {
                    echo "Checking ML quality gate against held-out baseline thresholds (Acc >= 0.75, F1 >= 0.70)..."
                    if (isUnix()) {
                        sh 'python3 -m pytest app/tests/test_quality_gate.py -v'
                    } else {
                        bat 'python -m pytest app/tests/test_quality_gate.py -v'
                    }
                }
            }
        }

        stage('Package') {
            when {
                expression { return params.BUILD_DOCKER_IMAGES }
            }
            steps {
                echo '=== Stage 6: Build Container Images ==='
                script {
                    if (isUnix()) {
                        sh 'docker compose build'
                    } else {
                        bat 'docker compose build'
                    }
                }
            }
        }

        stage('Deploy & Smoke Test') {
            steps {
                echo '=== Stage 7: Deployment Verification & Smoke Test ==='
                script {
                    def smokeCmd = 'python -c "from app.predictor import predict_mood; r=predict_mood(\'I am feeling so grateful and peaceful today.\'); assert r[\'predicted_mood\'] is not None; print(\'Smoke Test Passed! Mood:\', r[\'predicted_mood\'], \'Sentiment:\', r[\'sentiment\'])"'
                    if (isUnix()) {
                        sh smokeCmd
                    } else {
                        bat smokeCmd
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Archiving test results and build artifacts...'
            junit testResults: '**/surefire-reports/*.xml,pytest-results.xml', allowEmptyResults: true
        }
        success {
            echo 'SereneMind Mental Health Journal Pipeline SUCCEEDED! All 7 stages passed.'
        }
        failure {
            echo 'Pipeline FAILED! Check the stage logs above for the failed assertion or quality gate.'
        }
    }
}
