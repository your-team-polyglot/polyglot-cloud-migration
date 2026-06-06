pipeline {
    agent any
    environment {
        DOCKER_USER = credentials('docker-username')
    }
    stages {
        stage('Pull Images') {
            steps {
                sh """
                    echo ${DOCKER_USER_PSW} | docker login -u ${DOCKER_USER_USR} --password-stdin
                    docker pull ${DOCKER_USER_USR}/backend-dotnet:latest
                    docker pull ${DOCKER_USER_USR}/worker-python:latest
                    docker pull ${DOCKER_USER_USR}/frontend-js:latest
                """
            }
        }
        stage('Deploy') {
            steps {
                sh """
                    docker stop polyglot-backend polyglot-frontend polyglot-worker polyglot-redis 2>/dev/null || true
                    docker rm polyglot-backend polyglot-frontend polyglot-worker polyglot-redis 2>/dev/null || true
                    docker network create polyglot-net 2>/dev/null || true
                    docker run -d --name polyglot-redis --network polyglot-net redis:7-alpine
                    docker run -d --name polyglot-backend --network polyglot-net -p 8081:8080 ${DOCKER_USER_USR}/backend-dotnet:latest
                    docker run -d --name polyglot-worker --network polyglot-net -e REDIS_HOST=polyglot-redis ${DOCKER_USER_USR}/worker-python:latest
                    docker run -d --name polyglot-frontend --network polyglot-net -p 80:80 ${DOCKER_USER_USR}/frontend-js:latest
                """
            }
        }
        stage('Health Check') {
            steps {
                sh 'sleep 10 && curl -f http://localhost:8081/api/status'
            }
        }
    }
    post {
        success { echo 'Deployment successful!' }
        failure { echo 'Deployment failed!' }
    }
}
