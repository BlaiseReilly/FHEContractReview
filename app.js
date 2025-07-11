// Privacy Contract Review System
class PrivacyContractReview {
    constructor() {
        this.contractAddress = "0x5A042B49224ae2d67d5F216DC9A243F6603848F1"; // Enter your deployed contract address here
        this.contractABI = [
            "function submitContract(string memory _documentHash, string memory _publicTitle) external returns (uint256)",
            "function reviewClause(uint256 _contractId, string memory _clauseType, uint8 _complianceRating, uint8 _sensitivityLevel, string memory _notes) external",
            "function completePrivacyAnalysis(uint256 _contractId, uint32 _dataSensitivity, uint8 _gdprCompliance, uint8 _ccpaCompliance, uint8 _retentionRisk, uint8 _sharingRisk) external",
            "function authorizeReviewer(address _reviewer) external",
            "function revokeReviewer(address _reviewer) external",
            "function getContractInfo(uint256 _contractId) external view returns (string memory, address, uint256, bool, string memory, uint256)",
            "function getClauseInfo(uint256 _contractId, uint256 _clauseId) external view returns (string memory, address, uint256, string memory)",
            "function getAnalysisStatus(uint256 _contractId) external view returns (bool)",
            "function getSubmitterContracts(address _submitter) external view returns (uint256[])",
            "function getReviewerContracts(address _reviewer) external view returns (uint256[])",
            "function isAuthorizedReviewer(address _reviewer) external view returns (bool)",
            "function getTotalContracts() external view returns (uint256)",
            "function owner() external view returns (address)",
            "event ContractSubmitted(uint256 indexed contractId, address indexed submitter, string publicTitle)",
            "event ClauseReviewed(uint256 indexed contractId, uint256 indexed clauseId, address indexed reviewer)",
            "event AnalysisCompleted(uint256 indexed contractId, address indexed reviewer)",
            "event ReviewerAuthorized(address indexed reviewer, address indexed authorizedBy)",
            "event ReviewerRevoked(address indexed reviewer, address indexed revokedBy)",
            "event ComplianceAlert(uint256 indexed contractId, uint256 alertLevel)"
        ];

        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.userAddress = null;
        this.isOwner = false;
        this.isReviewer = false;

        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupTabs();
        await this.checkWalletConnection();
    }

    setupEventListeners() {
        document.getElementById('connect-wallet').addEventListener('click', () => this.connectWallet());
        document.getElementById('submit-form').addEventListener('submit', (e) => this.handleSubmitContract(e));
        document.getElementById('review-form').addEventListener('submit', (e) => this.handleReviewClause(e));
        document.getElementById('analysis-form').addEventListener('submit', (e) => this.handleCompleteAnalysis(e));
        document.getElementById('authorize-reviewer').addEventListener('click', () => this.authorizeReviewer());
        document.getElementById('revoke-reviewer').addEventListener('click', () => this.revokeReviewer());
        document.getElementById('set-temp-address').addEventListener('click', () => this.setTempContractAddress());
    }

    setTempContractAddress() {
        const addressInput = document.getElementById('temp-contract-address');
        const address = addressInput.value.trim();

        if (!address) {
            this.showAlert('Please enter a contract address.', 'error');
            return;
        }

        if (!ethers.isAddress(address)) {
            this.showAlert('Please enter a valid Ethereum address.', 'error');
            return;
        }

        this.contractAddress = address;
        this.updateContractAddressDisplay();

        if (this.signer) {
            this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.signer);
            this.checkUserRoles();
            this.loadUserContracts();
            this.loadAvailableContracts();
        }

        this.showAlert('Contract address updated successfully!', 'success');
        addressInput.value = '';
    }

    updateContractAddressDisplay() {
        const addressDisplay = document.getElementById('current-address');
        if (this.contractAddress && this.contractAddress !== "") {
            addressDisplay.textContent = `${this.contractAddress.substring(0, 10)}...${this.contractAddress.substring(34)}`;
            document.getElementById('config-notice').style.backgroundColor = '#d4edda';
        } else {
            addressDisplay.textContent = 'Not configured';
            document.getElementById('config-notice').style.backgroundColor = '#fff3cd';
        }
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');

                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(tc => tc.classList.remove('active'));

                tab.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
            });
        });
    }

    async checkWalletConnection() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    await this.connectWallet();
                }
            } catch (error) {
                console.error('Error checking wallet connection:', error);
            }
        }
    }

    async connectWallet() {
        try {
            // Check if MetaMask is installed
            if (typeof window.ethereum === 'undefined') {
                this.showAlert('MetaMask is not installed. Please install MetaMask from https://metamask.io to use this application.', 'error');
                return;
            }

            // Check if we can access ethereum object
            if (!window.ethereum.isMetaMask) {
                this.showAlert('Please use MetaMask wallet to connect.', 'error');
                return;
            }

            this.showAlert('Connecting to MetaMask...', 'info');

            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (!accounts || accounts.length === 0) {
                this.showAlert('No accounts found. Please check your MetaMask wallet.', 'error');
                return;
            }

            // Initialize provider and signer
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
            this.userAddress = await this.signer.getAddress();

            // Get network information
            const network = await this.provider.getNetwork();
            console.log('Connected to network:', network.name, 'Chain ID:', network.chainId);

            // Check if contract address is set
            if (!this.contractAddress || this.contractAddress === "") {
                this.showAlert('Contract address not configured. Please set the contract address in app.js', 'error');
                document.getElementById('main-content').classList.remove('hidden');
                this.updateWalletUI();
                return;
            }

            // Initialize contract
            this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.signer);

            // Check user roles and load data
            await this.checkUserRoles();
            this.updateWalletUI();
            this.updateContractAddressDisplay();

            // Only load contract data if contract address is properly set
            if (this.contractAddress && this.contractAddress !== "") {
                await this.loadUserContracts();
                await this.loadAvailableContracts();
            }

            document.getElementById('main-content').classList.remove('hidden');
            this.showAlert('Wallet connected successfully!', 'success');

            // Set up event listeners for account/network changes
            this.setupWalletEventListeners();

        } catch (error) {
            console.error('Error connecting wallet:', error);

            if (error.code === 4001) {
                this.showAlert('Connection rejected by user. Please try again.', 'error');
            } else if (error.code === -32002) {
                this.showAlert('Connection request pending. Please check MetaMask.', 'info');
            } else {
                this.showAlert(`Failed to connect wallet: ${error.message}`, 'error');
            }
        }
    }

    setupWalletEventListeners() {
        if (window.ethereum) {
            // Remove existing listeners to prevent duplicates
            window.ethereum.removeAllListeners('accountsChanged');
            window.ethereum.removeAllListeners('chainChanged');

            // Account change handler
            window.ethereum.on('accountsChanged', (accounts) => {
                console.log('Accounts changed:', accounts);
                if (accounts.length === 0) {
                    this.disconnectWallet();
                } else {
                    // Reload the page to reset state
                    window.location.reload();
                }
            });

            // Network change handler
            window.ethereum.on('chainChanged', (chainId) => {
                console.log('Chain changed to:', chainId);
                window.location.reload();
            });
        }
    }

    async checkUserRoles() {
        try {
            if (!this.contract || !this.contractAddress || this.contractAddress === "") {
                console.log('Contract not initialized, setting default user role');
                document.getElementById('user-role').textContent = 'User';
                return;
            }

            const owner = await this.contract.owner();
            this.isOwner = owner.toLowerCase() === this.userAddress.toLowerCase();

            this.isReviewer = await this.contract.isAuthorizedReviewer(this.userAddress);

            const roleText = this.isOwner ? 'Owner' : (this.isReviewer ? 'Authorized Reviewer' : 'User');
            document.getElementById('user-role').textContent = roleText;

            if (this.isOwner) {
                document.getElementById('admin-tab').classList.remove('hidden');
            } else {
                document.getElementById('admin-tab').classList.add('hidden');
            }

            if (this.isReviewer) {
                document.querySelector('[data-tab="review"]').style.display = 'block';
            } else {
                document.querySelector('[data-tab="review"]').style.display = 'none';
            }
        } catch (error) {
            console.error('Error checking user roles:', error);
            document.getElementById('user-role').textContent = 'User';
            this.showAlert('Contract not deployed or network mismatch. Some features may be unavailable.', 'info');
        }
    }

    disconnectWallet() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.userAddress = null;
        this.isOwner = false;
        this.isReviewer = false;

        document.getElementById('wallet-status').innerHTML = `
            <button id="connect-wallet" class="btn">
                <i class="fas fa-plug"></i> Connect MetaMask
            </button>
        `;
        document.getElementById('wallet-info').classList.add('hidden');
        document.getElementById('main-content').classList.add('hidden');
        document.getElementById('admin-tab').classList.add('hidden');

        document.getElementById('connect-wallet').addEventListener('click', () => this.connectWallet());
    }

    updateWalletUI() {
        document.getElementById('wallet-status').innerHTML = `
            <button class="btn btn-danger" onclick="window.location.reload()">
                <i class="fas fa-sign-out-alt"></i> Disconnect
            </button>
        `;

        document.getElementById('wallet-address').textContent =
            `${this.userAddress.substring(0, 6)}...${this.userAddress.substring(38)}`;
        document.getElementById('network-name').textContent = 'Zama Devnet';
        document.getElementById('wallet-info').classList.remove('hidden');
    }

    async handleSubmitContract(e) {
        e.preventDefault();

        const title = document.getElementById('contract-title').value;
        const documentHash = document.getElementById('document-hash').value;

        if (!title || !documentHash) {
            this.showAlert('Please fill in all required fields.', 'error');
            return;
        }

        try {
            this.showAlert('Submitting contract...', 'info');

            const tx = await this.contract.submitContract(documentHash, title);
            await tx.wait();

            this.showAlert('Contract submitted successfully!', 'success');
            document.getElementById('submit-form').reset();
            await this.loadUserContracts();

        } catch (error) {
            console.error('Error submitting contract:', error);
            this.showAlert('Failed to submit contract. Please try again.', 'error');
        }
    }

    async handleReviewClause(e) {
        e.preventDefault();

        const contractId = document.getElementById('review-contract-id').value;
        const clauseType = document.getElementById('clause-type').value;
        const complianceRating = document.getElementById('compliance-rating').value;
        const sensitivityLevel = document.getElementById('sensitivity-level').value;
        const notes = document.getElementById('review-notes').value;

        if (!contractId || !clauseType || !complianceRating || !sensitivityLevel) {
            this.showAlert('Please fill in all required fields.', 'error');
            return;
        }

        try {
            this.showAlert('Submitting clause review...', 'info');

            const tx = await this.contract.reviewClause(
                contractId,
                clauseType,
                complianceRating,
                sensitivityLevel,
                notes
            );
            await tx.wait();

            this.showAlert('Clause review submitted successfully!', 'success');
            document.getElementById('review-form').reset();

        } catch (error) {
            console.error('Error submitting review:', error);
            this.showAlert('Failed to submit review. Please try again.', 'error');
        }
    }

    async handleCompleteAnalysis(e) {
        e.preventDefault();

        const contractId = document.getElementById('analysis-contract-id').value;
        const dataSensitivity = document.getElementById('data-sensitivity').value;
        const gdprCompliance = document.getElementById('gdpr-compliance').value;
        const ccpaCompliance = document.getElementById('ccpa-compliance').value;
        const retentionRisk = document.getElementById('retention-risk').value;
        const sharingRisk = document.getElementById('sharing-risk').value;

        if (!contractId || !dataSensitivity || !gdprCompliance || !ccpaCompliance || !retentionRisk || !sharingRisk) {
            this.showAlert('Please fill in all required fields.', 'error');
            return;
        }

        try {
            this.showAlert('Completing privacy analysis...', 'info');

            const tx = await this.contract.completePrivacyAnalysis(
                contractId,
                dataSensitivity,
                gdprCompliance,
                ccpaCompliance,
                retentionRisk,
                sharingRisk
            );
            await tx.wait();

            this.showAlert('Privacy analysis completed successfully!', 'success');
            document.getElementById('analysis-form').reset();

        } catch (error) {
            console.error('Error completing analysis:', error);
            this.showAlert('Failed to complete analysis. Please try again.', 'error');
        }
    }

    async authorizeReviewer() {
        const reviewerAddress = document.getElementById('reviewer-address').value;

        if (!reviewerAddress || !ethers.isAddress(reviewerAddress)) {
            this.showAlert('Please enter a valid Ethereum address.', 'error');
            return;
        }

        try {
            this.showAlert('Authorizing reviewer...', 'info');

            const tx = await this.contract.authorizeReviewer(reviewerAddress);
            await tx.wait();

            this.showAlert('Reviewer authorized successfully!', 'success');
            document.getElementById('reviewer-address').value = '';

        } catch (error) {
            console.error('Error authorizing reviewer:', error);
            this.showAlert('Failed to authorize reviewer. Please try again.', 'error');
        }
    }

    async revokeReviewer() {
        const reviewerAddress = document.getElementById('reviewer-address').value;

        if (!reviewerAddress || !ethers.isAddress(reviewerAddress)) {
            this.showAlert('Please enter a valid Ethereum address.', 'error');
            return;
        }

        try {
            this.showAlert('Revoking reviewer...', 'info');

            const tx = await this.contract.revokeReviewer(reviewerAddress);
            await tx.wait();

            this.showAlert('Reviewer revoked successfully!', 'success');
            document.getElementById('reviewer-address').value = '';

        } catch (error) {
            console.error('Error revoking reviewer:', error);
            this.showAlert('Failed to revoke reviewer. Please try again.', 'error');
        }
    }

    async loadUserContracts() {
        try {
            if (!this.contract || !this.contractAddress || this.contractAddress === "") {
                document.getElementById('my-contracts-list').innerHTML = '<p>Contract not configured. Please set contract address to view your contracts.</p>';
                return;
            }

            const contractIds = await this.contract.getSubmitterContracts(this.userAddress);
            const contractsList = document.getElementById('my-contracts-list');

            if (contractIds.length === 0) {
                contractsList.innerHTML = '<p>No contracts submitted yet.</p>';
                return;
            }

            let html = '';
            for (let i = 0; i < contractIds.length; i++) {
                const contractId = contractIds[i];
                const contractInfo = await this.contract.getContractInfo(contractId);

                html += `
                    <div class="contract-item">
                        <div class="contract-header">
                            <div class="contract-title">Contract #${contractId}: ${contractInfo[4]}</div>
                            <div class="status ${contractInfo[3] ? 'reviewed' : 'pending'}">
                                ${contractInfo[3] ? 'Reviewed' : 'Pending Review'}
                            </div>
                        </div>
                        <div class="contract-meta">
                            <span><i class="fas fa-calendar"></i> ${new Date(Number(contractInfo[2]) * 1000).toLocaleDateString()}</span>
                            <span><i class="fas fa-file"></i> ${contractInfo[0]}</span>
                            <span><i class="fas fa-list"></i> ${contractInfo[5]} Clauses</span>
                        </div>
                    </div>
                `;
            }

            contractsList.innerHTML = html;

        } catch (error) {
            console.error('Error loading user contracts:', error);
            document.getElementById('my-contracts-list').innerHTML = '<p>Unable to load contracts. Please check network connection and contract address.</p>';
        }
    }

    async loadAvailableContracts() {
        if (!this.isReviewer) {
            document.getElementById('review-contracts-list').innerHTML = '<p>You must be an authorized reviewer to view contracts for review.</p>';
            return;
        }

        try {
            if (!this.contract || !this.contractAddress || this.contractAddress === "") {
                document.getElementById('review-contracts-list').innerHTML = '<p>Contract not configured. Please set contract address to view available contracts.</p>';
                return;
            }

            const totalContracts = await this.contract.getTotalContracts();
            const contractsList = document.getElementById('review-contracts-list');

            if (totalContracts === 0n) {
                contractsList.innerHTML = '<p>No contracts available for review.</p>';
                return;
            }

            let html = '';
            for (let i = 1; i <= Number(totalContracts); i++) {
                const contractInfo = await this.contract.getContractInfo(i);
                const analysisComplete = await this.contract.getAnalysisStatus(i);

                html += `
                    <div class="contract-item">
                        <div class="contract-header">
                            <div class="contract-title">Contract #${i}: ${contractInfo[4]}</div>
                            <div class="status ${contractInfo[3] ? 'reviewed' : 'pending'}">
                                ${contractInfo[3] ? 'Reviewed' : 'Pending Review'}
                            </div>
                        </div>
                        <div class="contract-meta">
                            <span><i class="fas fa-user"></i> Submitter: ${contractInfo[1].substring(0, 10)}...</span>
                            <span><i class="fas fa-calendar"></i> ${new Date(Number(contractInfo[2]) * 1000).toLocaleDateString()}</span>
                            <span><i class="fas fa-list"></i> ${contractInfo[5]} Clauses</span>
                            <span><i class="fas fa-chart-line"></i> Analysis: ${analysisComplete ? 'Complete' : 'Pending'}</span>
                        </div>
                    </div>
                `;
            }

            contractsList.innerHTML = html;

        } catch (error) {
            console.error('Error loading available contracts:', error);
            document.getElementById('review-contracts-list').innerHTML = '<p>Unable to load contracts. Please check network connection and contract address.</p>';
        }
    }

    showAlert(message, type) {
        const alertsContainer = document.getElementById('alerts');
        const alertId = Date.now();

        const alertHTML = `
            <div id="alert-${alertId}" class="alert ${type}">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                ${message}
            </div>
        `;

        alertsContainer.innerHTML = alertHTML + alertsContainer.innerHTML;

        setTimeout(() => {
            const alertElement = document.getElementById(`alert-${alertId}`);
            if (alertElement) {
                alertElement.remove();
            }
        }, 5000);
    }

    formatAddress(address) {
        return `${address.substring(0, 6)}...${address.substring(38)}`;
    }

    formatDate(timestamp) {
        return new Date(Number(timestamp) * 1000).toLocaleDateString();
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PrivacyContractReview();
});