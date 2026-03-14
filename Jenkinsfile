pipeline {
    agent any

    tools {
        nodejs 'NODE_HOME'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Run Application') {
            steps {
                bat 'nohup npm start &'
            }
        }
    }
}