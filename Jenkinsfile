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
             environment {
                MONGODB_URI = credentials('MONGODB_URI')
                GROQ_API_KEY = credentials("GROQ_API_KEY")
            }
            steps {
                bat 'npm run build'
            }
        }

       
    }
}