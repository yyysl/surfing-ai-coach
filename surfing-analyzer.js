// 冲浪AI教练 - 智能视频分析系统

class SurfingAIAnalyzer {
    constructor() {
        this.videoFile = null;
        this.videoPlayer = null;
        this.analyzedVideo = null;
        this.openaiApiKey = null;
        this.analysisLevel = 'detailed';
        this.videoQuality = '1080p';
        this.analysisResults = null;
        this.aiAnalyzer = null;
        this.videoProcessor = null;
        this.currentAnnotations = [];
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupDragAndDrop();
        this.loadSettings();
        this.initializeAIComponents();
    }

    // 初始化AI组件
    initializeAIComponents() {
        // 初始化AI分析器
        this.aiAnalyzer = new AIAnalyzer();
        
        // 初始化视频处理器
        this.videoProcessor = new VideoProcessor();
        
        // 设置进度回调
        this.aiAnalyzer.setProgressCallback((progress, text) => {
            this.updateProgress(progress, text);
        });
    }

    cacheElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.videoSection = document.getElementById('videoSection');
        this.analysisProgress = document.getElementById('analysisProgress');
        this.analysisResults = document.getElementById('analysisResults');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.videoPlayer = document.getElementById('videoPlayer');
        this.analyzedVideo = document.getElementById('analyzedVideo');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.openSettingsBtn = document.getElementById('openSettings');
        this.closeSettingsBtn = document.getElementById('closeSettings');
        this.saveSettingsBtn = document.getElementById('saveSettings');
    }

    bindEvents() {
        // 上传按钮点击事件
        this.uploadBtn.addEventListener('click', () => {
            document.getElementById('videoInput').click();
        });

        // 文件选择事件
        document.getElementById('videoInput').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // AI分析按钮事件
        this.analyzeBtn.addEventListener('click', () => {
            this.startAnalysis();
        });

        // 重置按钮事件
        this.resetBtn.addEventListener('click', () => {
            this.resetApp();
        });

        // 设置面板事件
        this.openSettingsBtn.addEventListener('click', () => {
            this.openSettings();
        });

        this.closeSettingsBtn.addEventListener('click', () => {
            this.closeSettings();
        });

        this.saveSettingsBtn.addEventListener('click', () => {
            this.saveSettings();
        });

        // 下载和分享按钮
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadAnalyzedVideo();
        });

        document.getElementById('shareBtn').addEventListener('click', () => {
            this.shareResults();
        });
    }

    setupDragAndDrop() {
        // 拖拽进入
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        // 拖拽离开
        this.uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
        });

        // 拖拽放下
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });
    }

    handleFileSelect(file) {
        if (!file) return;

        // 验证文件类型
        if (!file.type.startsWith('video/')) {
            this.showNotification('请选择有效的视频文件', 'error');
            return;
        }

        // 验证文件大小 (200MB)
        if (file.size > 200 * 1024 * 1024) {
            this.showNotification('文件大小不能超过200MB', 'error');
            return;
        }

        this.videoFile = file;
        this.displayVideo(file);
        this.showVideoSection();
    }

    displayVideo(file) {
        const url = URL.createObjectURL(file);
        this.videoPlayer.src = url;
        this.videoPlayer.load();
    }

    showVideoSection() {
        this.uploadArea.style.display = 'none';
        this.videoSection.style.display = 'block';
        this.videoSection.classList.add('fade-in');
    }

    async startAnalysis() {
        if (!this.videoFile) {
            this.showNotification('请先上传视频文件', 'warning');
            return;
        }

        if (!this.openaiApiKey) {
            this.showNotification('请先在设置中配置OpenAI API Key', 'warning');
            this.openSettings();
            return;
        }

        // 显示分析进度区域
        this.analysisProgress.style.display = 'block';
        this.analysisProgress.classList.add('fade-in');
        
        // 隐藏视频区域
        this.videoSection.style.display = 'none';
        
        // 开始分析流程
        await this.runAnalysis();
    }

    async runAnalysis() {
        try {
            // 配置AI分析器
            this.aiAnalyzer.setApiKey(this.openaiApiKey);
            this.aiAnalyzer.setAnalysisLevel(this.analysisLevel);

            // 初始化视频处理器
            await this.videoProcessor.init(this.videoPlayer);

            // 步骤1: 识别冲浪者
            await this.updateProgress(10, '正在识别冲浪者...');
            await this.activateStep(1);
            await this.delay(1000);

            // 步骤2: 分析动作轨迹
            await this.updateProgress(30, '正在分析动作轨迹...');
            await this.activateStep(2);
            
            // 执行AI分析
            this.analysisResults = await this.aiAnalyzer.analyzeVideo(this.videoPlayer, 2);
            
            // 步骤3: 生成优化建议
            await this.updateProgress(70, '正在生成优化建议...');
            await this.activateStep(3);
            await this.delay(1000);

            // 步骤4: 生成分析视频
            await this.updateProgress(90, '正在生成分析视频...');
            await this.activateStep(4);
            
            // 生成带标注的视频
            await this.generateAnnotatedVideo();

            // 完成分析
            await this.updateProgress(100, '分析完成！');
            await this.delay(500);

            // 显示结果
            this.showAnalysisResults();

        } catch (error) {
            console.error('分析过程中出错:', error);
            console.error('错误详情:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            // 显示详细的错误信息
            let errorMessage = '分析过程中出现错误';
            if (error.message.includes('OpenAI API错误')) {
                errorMessage = `OpenAI API错误: ${error.message}`;
            } else if (error.message.includes('CORS')) {
                errorMessage = '网络请求被阻止，请检查浏览器设置';
            } else if (error.message.includes('video')) {
                errorMessage = '视频处理错误，请确保视频格式正确';
            }
            
            this.showNotification(`${errorMessage}，显示模拟结果`, 'warning');
            // 显示模拟结果作为备选
            this.showMockResults();
        }
    }

    async updateProgress(percentage, text) {
        this.progressFill.style.width = percentage + '%';
        this.progressText.textContent = text;
    }

    async activateStep(stepNumber) {
        // 重置所有步骤
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`step${i}`).classList.remove('active');
        }
        
        // 激活当前步骤
        document.getElementById(`step${stepNumber}`).classList.add('active');
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showAnalysisResults() {
        // 隐藏分析进度
        this.analysisProgress.style.display = 'none';
        
        // 显示分析结果
        this.analysisResults.style.display = 'block';
        this.analysisResults.classList.add('fade-in');
        
        // 生成分析报告
        const report = this.aiAnalyzer.generateAnalysisReport(this.analysisResults);
        
        // 更新UI显示分析结果
        this.updateAnalysisResults(report);
        
        // 设置视频播放器
        this.setupAnnotatedVideoPlayer();
    }

    // 生成带标注的视频
    async generateAnnotatedVideo() {
        // 收集所有标注
        this.currentAnnotations = [];
        this.analysisResults.forEach(result => {
            if (result.annotations) {
                this.currentAnnotations.push(...result.annotations);
            }
        });

        // 将标注添加到视频处理器
        this.videoProcessor.clearAnnotations();
        this.currentAnnotations.forEach(annotation => {
            this.videoProcessor.addAnnotation(annotation);
        });
    }

    // 设置带标注的视频播放器
    setupAnnotatedVideoPlayer() {
        if (this.videoPlayer.src) {
            this.analyzedVideo.src = this.videoPlayer.src;
            this.analyzedVideo.load();
            
            // 监听视频播放事件，实时绘制标注
            this.analyzedVideo.addEventListener('timeupdate', () => {
                this.drawCurrentAnnotations();
            });
        }
    }

    // 绘制当前时间点的标注
    drawCurrentAnnotations() {
        const currentTime = this.analyzedVideo.currentTime;
        const overlay = document.getElementById('videoOverlay');
        
        if (!overlay) return;
        
        // 清除之前的标注
        overlay.innerHTML = '';
        
        // 获取当前时间点的标注
        const currentAnnotations = this.getAnnotationsAtTime(currentTime);
        
        // 绘制标注
        currentAnnotations.forEach(annotation => {
            this.drawAnnotation(annotation, overlay);
        });
    }

    // 获取指定时间点的标注
    getAnnotationsAtTime(time) {
        return this.currentAnnotations.filter(annotation => {
            const annotationTime = this.parseTime(annotation.timestamp);
            return Math.abs(annotationTime - time) < 0.5; // 0.5秒容差
        });
    }

    // 解析时间字符串为秒数
    parseTime(timeStr) {
        if (typeof timeStr === 'number') return timeStr;
        const parts = timeStr.split(':');
        if (parts.length === 2) {
            return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
        return 0;
    }

    // 绘制单个标注
    drawAnnotation(annotation, container) {
        const { type, position, style, text, description } = annotation;
        
        const annotationElement = document.createElement('div');
        annotationElement.className = `annotation ${type} ${style}`;
        annotationElement.style.cssText = `
            position: absolute;
            left: ${position.x}%;
            top: ${position.y}%;
            pointer-events: none;
            z-index: 10;
        `;
        
        switch (type) {
            case 'line':
                annotationElement.innerHTML = this.createLineAnnotation(text, style);
                break;
            case 'text':
                annotationElement.innerHTML = this.createTextAnnotation(text, description);
                break;
            case 'arrow':
                annotationElement.innerHTML = this.createArrowAnnotation(text, style);
                break;
            case 'circle':
                annotationElement.innerHTML = this.createCircleAnnotation(text, description);
                break;
        }
        
        container.appendChild(annotationElement);
    }

    // 创建线条标注
    createLineAnnotation(text, style) {
        const lineClass = style === 'speed-line' ? 'speed-line' : 'action-line';
        return `
            <div class="annotation-line ${lineClass}">
                <div class="line-text">${text}</div>
            </div>
        `;
    }

    // 创建文字标注
    createTextAnnotation(text, description) {
        return `
            <div class="annotation-text">
                <div class="text-main">${text}</div>
                ${description ? `<div class="text-description">${description}</div>` : ''}
            </div>
        `;
    }

    // 创建箭头标注
    createArrowAnnotation(text, style) {
        return `
            <div class="annotation-arrow ${style}">
                <div class="arrow-line"></div>
                <div class="arrow-head"></div>
                <div class="arrow-text">${text}</div>
            </div>
        `;
    }

    // 创建圆形标注
    createCircleAnnotation(text, description) {
        return `
            <div class="annotation-circle">
                <div class="circle-outline"></div>
                <div class="circle-text">${text}</div>
                ${description ? `<div class="circle-description">${description}</div>` : ''}
            </div>
        `;
    }

    // 更新分析结果UI
    updateAnalysisResults(report) {
        // 更新评分
        document.querySelector('.score').textContent = report.overallScore;
        
        // 更新动作数量
        document.querySelector('.actions-count').textContent = report.keyMoments.length;
        
        // 更新动作时间线
        this.updateActionsTimeline(report.keyMoments);
        
        // 更新评分描述
        this.updateScoreDescription(report.overallScore);
        
        // 更新技术分解
        this.updateTechnicalBreakdown(report.technicalBreakdown);
    }

    // 更新技术分解
    updateTechnicalBreakdown(breakdown) {
        // 这里可以添加技术分解的UI更新逻辑
        console.log('技术分解:', breakdown);
    }

    // 显示模拟结果（作为备选）
    showMockResults() {
        // 隐藏分析进度
        this.analysisProgress.style.display = 'none';
        
        // 显示分析结果
        this.analysisResults.style.display = 'block';
        this.analysisResults.classList.add('fade-in');
        
        // 生成模拟的分析视频
        this.generateAnalyzedVideo();
        
        // 调用OpenAI进行真实分析
        this.performOpenAIAnalysis();
    }

    async performOpenAIAnalysis() {
        try {
            // 这里将调用OpenAI API进行真实的视频分析
            // 由于视频分析需要特殊的API，这里我们模拟分析过程
            
            const analysisPrompt = `
            请分析这个冲浪视频，并提供以下信息：
            1. 冲浪者的技术水平评估（1-10分）
            2. 识别关键动作点（起乘、转向、回切等）
            3. 每个动作的具体建议和改进方向
            4. 整体表现评价
            
            请用中文回答，格式要清晰易读。
            `;

            // 模拟OpenAI API调用
            const mockAnalysis = await this.mockOpenAIAnalysis(analysisPrompt);
            
            // 更新UI显示真实分析结果
            this.updateAnalysisResults(mockAnalysis);
            
        } catch (error) {
            console.error('OpenAI分析失败:', error);
            this.showNotification('AI分析失败，显示模拟结果', 'warning');
        }
    }

    async mockOpenAIAnalysis(prompt) {
        // 模拟OpenAI API响应
        await this.delay(2000);
        
        return {
            score: 8.7,
            duration: '2:45',
            actionsCount: 12,
            actions: [
                {
                    time: '0:15',
                    name: '起乘动作',
                    description: '时机把握准确，重心控制良好，建议继续保持',
                    type: 'positive',
                    technique: '起乘'
                },
                {
                    time: '0:28',
                    name: '转向时机',
                    description: '建议在浪峰处提前0.3秒开始转向，可以获得更好的动力和流畅性',
                    type: 'warning',
                    technique: '转向'
                },
                {
                    time: '0:42',
                    name: '回切动作',
                    description: '回切角度适中，但可以更激进一些，增加动作的观赏性',
                    type: 'improvement',
                    technique: '回切'
                },
                {
                    time: '1:05',
                    name: '重心控制',
                    description: '在高速滑行时重心控制稳定，表现优秀',
                    type: 'positive',
                    technique: '平衡'
                },
                {
                    time: '1:18',
                    name: '手臂位置',
                    description: '保持手臂在身体两侧，有助于更好的平衡控制',
                    type: 'improvement',
                    technique: '姿态'
                }
            ],
            summary: '整体表现优秀，技术娴熟，在转向时机和回切动作上还有提升空间。建议多练习在浪峰处的转向时机把握，以及增加回切动作的激进程度。'
        };
    }

    updateAnalysisResults(analysis) {
        // 更新评分
        document.querySelector('.score').textContent = analysis.score;
        
        // 更新动作数量
        document.querySelector('.actions-count').textContent = analysis.actionsCount;
        
        // 更新动作时间线
        this.updateActionsTimeline(analysis.actions);
        
        // 更新评分描述
        this.updateScoreDescription(analysis.score);
    }

    updateActionsTimeline(actions) {
        const timeline = document.querySelector('.actions-timeline');
        timeline.innerHTML = '';
        
        actions.forEach(action => {
            const actionItem = document.createElement('div');
            actionItem.className = 'action-item';
            actionItem.innerHTML = `
                <div class="action-time">${action.time}</div>
                <div class="action-content">
                    <h5>${action.name}</h5>
                    <p>${action.description}</p>
                    <div class="action-tags">
                        <span class="tag ${action.type}">${this.getTagText(action.type)}</span>
                        <span class="tag technique">${action.technique}</span>
                    </div>
                </div>
            `;
            timeline.appendChild(actionItem);
        });
    }

    getTagText(type) {
        switch (type) {
            case 'positive': return '优秀';
            case 'warning': return '需改进';
            case 'improvement': return '可优化';
            default: return '一般';
        }
    }

    updateScoreDescription(score) {
        const descriptionElement = document.querySelector('.score-description');
        if (score >= 9.0) {
            descriptionElement.textContent = '表现卓越，技术精湛';
        } else if (score >= 8.0) {
            descriptionElement.textContent = '表现优秀，技术娴熟';
        } else if (score >= 7.0) {
            descriptionElement.textContent = '表现良好，有提升空间';
        } else if (score >= 6.0) {
            descriptionElement.textContent = '表现一般，需要多加练习';
        } else {
            descriptionElement.textContent = '需要更多练习，加油！';
        }
    }

    generateAnalyzedVideo() {
        // 这里应该生成带有分析标注的视频
        // 由于浏览器限制，我们使用原始视频作为示例
        if (this.videoPlayer.src) {
            this.analyzedVideo.src = this.videoPlayer.src;
            this.analyzedVideo.load();
        }
    }

    downloadAnalyzedVideo() {
        // 模拟下载功能
        this.showNotification('分析视频下载功能开发中...', 'info');
    }

    shareResults() {
        if (navigator.share) {
            navigator.share({
                title: '我的冲浪AI分析报告',
                text: '看看AI教练给我的冲浪建议！',
                url: window.location.href
            });
        } else {
            // 复制链接到剪贴板
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showNotification('链接已复制到剪贴板', 'success');
            });
        }
    }

    openSettings() {
        this.settingsPanel.classList.add('open');
    }

    closeSettings() {
        this.settingsPanel.classList.remove('open');
    }

    saveSettings() {
        this.openaiApiKey = document.getElementById('openaiKey').value;
        this.analysisLevel = document.getElementById('analysisLevel').value;
        this.videoQuality = document.getElementById('videoQuality').value;
        
        // 更新AI分析器设置
        if (this.aiAnalyzer) {
            this.aiAnalyzer.setApiKey(this.openaiApiKey);
            this.aiAnalyzer.setAnalysisLevel(this.analysisLevel);
        }
        
        // 保存到localStorage
        localStorage.setItem('surfingAI_settings', JSON.stringify({
            openaiApiKey: this.openaiApiKey,
            analysisLevel: this.analysisLevel,
            videoQuality: this.videoQuality
        }));
        
        this.showNotification('设置已保存', 'success');
        this.closeSettings();
    }

    loadSettings() {
        const settings = localStorage.getItem('surfingAI_settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.openaiApiKey = parsed.openaiApiKey;
            this.analysisLevel = parsed.analysisLevel;
            this.videoQuality = parsed.videoQuality;
            
            // 更新UI
            document.getElementById('openaiKey').value = this.openaiApiKey || '';
            document.getElementById('analysisLevel').value = this.analysisLevel || 'detailed';
            document.getElementById('videoQuality').value = this.videoQuality || '1080p';
        }
    }

    resetApp() {
        // 重置所有状态
        this.videoFile = null;
        this.videoPlayer.src = '';
        this.analyzedVideo.src = '';
        
        // 隐藏所有区域
        this.videoSection.style.display = 'none';
        this.analysisProgress.style.display = 'none';
        this.analysisResults.style.display = 'none';
        
        // 显示上传区域
        this.uploadArea.style.display = 'block';
        
        // 重置文件输入
        document.getElementById('videoInput').value = '';
        
        // 重置进度条
        this.progressFill.style.width = '0%';
        this.progressText.textContent = '准备分析...';
        
        // 重置步骤
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`step${i}`).classList.remove('active');
        }
        document.getElementById('step1').classList.add('active');
        
        // 移除动画类
        this.videoSection.classList.remove('fade-in');
        this.analysisProgress.classList.remove('fade-in');
        this.analysisResults.classList.remove('fade-in');
    }

    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease-out;
        `;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    getNotificationColor(type) {
        switch (type) {
            case 'success': return 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
            case 'error': return 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
            case 'warning': return 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)';
            case 'info': return 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)';
        }
    }
}

// 添加通知动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new SurfingAIAnalyzer();
});
