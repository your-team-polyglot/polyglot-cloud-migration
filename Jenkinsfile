pipeline {
    agent any

    environment {
        DOCKER_USERNAME  = credentials('docker-username')
        IMAGE_PREFIX     = "${DOCKER_USERNAME}/polyglot"
        CLOUD_VM_IP      = credentials('cloud-vm-ip')
        SSH_CREDS        = credentials('cloud-vm-ssh-key')
        IMAGE_TAG        = "${params.IMAGE_TAG ?: 'latest'}"
        DEPLOY_DIR       = '/opt/polyglot'
        APP_URL          = "http://${CLOUD_VM_IP}:3000"
    }

    parameters {
        string(name: 'IMAGE_TAG', defaultValue: 'latest', description: 'Docker image tag to deploy')
    }

    options {
        timeout(time: 15, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "Deploying tag: ${IMAGE_TAG}"
            }
        }

        stage('Verify Images Exist') {
            steps {
                script {
                    def services = ['backend', 'worker', 'frontend']
                    for (svc in services) {
                        sh """
                            docker manifest inspect ${IMAGE_PREFIX}-${svc}:${IMAGE_TAG} > /dev/null
                            echo "✓ Image ${IMAGE_PREFIX}-${svc}:${IMAGE_TAG} exists"
                        """
                    }
                }
            }
        }

        stage('Copy Deploy Files') {
            steps {
                sshagent(credentials: ['cloud-vm-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ec2-user@${CLOUD_VM_IP} \
                            "mkdir -p ${DEPLOY_DIR}"

                        scp -o StrictHostKeyChecking=no \
                            deploy/docker-compose.prod.yml \
                            deploy/deploy.sh \
                            ec2-user@${CLOUD_VM_IP}:${DEPLOY_DIR}/
                    """
                }
            }
        }

        stage('Pull Images on Cloud VM') {
            steps {
                sshagent(credentials: ['cloud-vm-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ec2-user@${CLOUD_VM_IP} \
                            "DOCKER_USERNAME=${DOCKER_USERNAME} TAG=${IMAGE_TAG} \
                             docker compose -f ${DEPLOY_DIR}/docker-compose.prod.yml pull"
                    """
                }
            }
        }

        stage('Deploy Containers') {
            steps {
                sshagent(credentials: ['cloud-vm-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ec2-user@${CLOUD_VM_IP} \
                            "DOCKER_USERNAME=${DOCKER_USERNAME} TAG=${IMAGE_TAG} \
                             docker compose -f ${DEPLOY_DIR}/docker-compose.prod.yml up -d --remove-orphans"
                    """
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    def maxRetries = 10
                    def retryInterval = 10

                    for (int i = 1; i <= maxRetries; i++) {
                        try {
                            sh "curl -sf ${APP_URL} > /dev/null"
                            echo "✓ Health check passed on attempt ${i}"
                            return
                        } catch (Exception e) {
                            if (i == maxRetries) {
                                error "Health check failed after ${maxRetries} attempts"
                            }
                            echo "Attempt ${i}/${maxRetries} failed. Retrying in ${retryInterval}s…"
                            sleep retryInterval
                        }
                    }
                }
            }
        }

        stage('Show Running Containers') {
            steps {
                sshagent(credentials: ['cloud-vm-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ec2-user@${CLOUD_VM_IP} \
                            "docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'"
                    """
                }
            }
        }
    }

    post {
        success {
            echo """
╔══════════════════════════════════════╗
║  ✅  DEPLOYMENT SUCCESSFUL           ║
║  App: ${APP_URL}
╚══════════════════════════════════════╝
            """
        }
        failure {
            echo "❌ Deployment FAILED. Check logs above."
            sshagent(credentials: ['cloud-vm-ssh-key']) {
                sh """
                    ssh -o StrictHostKeyChecking=no ec2-user@${CLOUD_VM_IP} \
                        "docker compose -f ${DEPLOY_DIR}/docker-compose.prod.yml logs --tail=50" || true
                """
            }
        }
        always {
            cleanWs()
        }
    }
}
