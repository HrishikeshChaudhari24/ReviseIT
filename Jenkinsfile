pipeline {
    agent any

    tools {
        nodejs 'node18'
    }

    stages {

        stage('Checkout Code') {
            steps {
                git 'git@github.com:HrishikeshChaudhari24/ReviseIT.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build Application') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Run Application') {
            steps {
                sh 'nohup npm start &'
            }
        }
    }
}