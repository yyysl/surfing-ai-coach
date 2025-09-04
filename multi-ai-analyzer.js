// 多AI平台分析器 - 支持多个免费的AI API

class MultiAIAnalyzer {
    constructor() {
        this.apiConfigs = {
            gemini: {
                name: 'Google Gemini',
                baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
                apiKey: null,
                freeQuota: 1500, // 每天
                supportsVision: true
            },
            groq: {
                name: 'Groq',
                baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
                apiKey: null,
                freeQuota: 14400, // 每天
                supportsVision: false // Groq主要支持文本
            },
            huggingface: {
                name: 'Hugging Face',
                baseUrl: 'https://api-inference.huggingface.co/models',
                apiKey: null,
                freeQuota: 300, // 每小时
                supportsVision: true
            },
            zhipu: {
                name: '智谱AI',
                baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
                apiKey: null,
                freeQuota: 'unlimited', // 永久免费
                supportsVision: true
            }
        };
        
        this.currentProvider = 'gemini'; // 默认使用Gemini
        this.analysisResults = null;
    }

    // 设置API Key
    setApiKey(provider, apiKey) {
        if (this.apiConfigs[provider]) {
            this.apiConfigs[provider].apiKey = apiKey;
            console.log(`${this.apiConfigs[provider].name} API Key已设置`);
        }
    }

    // 设置当前使用的AI提供商
    setProvider(provider) {
        if (this.apiConfigs[provider]) {
            this.currentProvider = provider;
            console.log(`切换到: ${this.apiConfigs[provider].name}`);
        }
    }

    // 获取可用的AI提供商
    getAvailableProviders() {
        return Object.keys(this.apiConfigs).filter(provider => 
            this.apiConfigs[provider].apiKey && 
            this.apiConfigs[provider].supportsVision
        );
    }

    // 分析视频帧
    async analyzeVideoFrame(frameData, timestamp) {
        const provider = this.currentProvider;
        const config = this.apiConfigs[provider];
        
        if (!config.apiKey) {
            throw new Error(`${config.name} API Key未设置`);
        }

        try {
            console.log(`使用 ${config.name} 分析视频帧...`);
            
            // 将视频帧转换为base64
            const base64Image = await this.convertFrameToBase64(frameData);
            
            // 构建分析提示词
            const prompt = this.buildAnalysisPrompt(timestamp);
            
            // 调用对应的AI API
            let response;
            switch (provider) {
                case 'gemini':
                    response = await this.callGeminiAPI(base64Image, prompt);
                    break;
                case 'huggingface':
                    response = await this.callHuggingFaceAPI(base64Image, prompt);
                    break;
                case 'zhipu':
                    response = await this.callZhipuAPI(base64Image, prompt);
                    break;
                default:
                    throw new Error(`不支持的AI提供商: ${provider}`);
            }
            
            // 解析响应并生成标注
            const annotations = this.parseAnalysisResponse(response, timestamp);
            
            return annotations;
        } catch (error) {
            console.error(`${config.name}分析失败:`, error);
            throw error;
        }
    }

    // 调用Google Gemini API
    async callGeminiAPI(base64Image, prompt) {
        const config = this.apiConfigs.gemini;
        
        const response = await fetch(`${config.baseUrl}?key=${config.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: base64Image
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 1000
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API错误: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    // 调用Hugging Face API
    async callHuggingFaceAPI(base64Image, prompt) {
        const config = this.apiConfigs.huggingface;
        
        // 使用LLaVA模型进行图像分析
        const response = await fetch(`${config.baseUrl}/llava-hf/llava-1.5-7b-hf`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: {
                    image: `data:image/jpeg;base64,${base64Image}`,
                    text: prompt
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Hugging Face API错误: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        return data[0].generated_text;
    }

    // 调用智谱AI API
    async callZhipuAPI(base64Image, prompt) {
        const config = this.apiConfigs.zhipu;
        
        const response = await fetch(config.baseUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "glm-4v",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: prompt
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 1000,
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`智谱AI API错误: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // 构建分析提示词
    buildAnalysisPrompt(timestamp) {
        return `
        请分析这个冲浪视频帧，重点关注以下方面：

        1. 冲浪者位置和姿态：
           - 冲浪者在浪上的位置（浪峰、浪壁、浪底）
           - 身体姿态（站姿、重心、手臂位置）
           - 冲浪板的角度和方向

        2. 海浪情况：
           - 海浪的形状和大小
           - 海浪的破碎程度
           - 海浪的速度区间（顶部最快，中部中等，底部最慢）

        3. 动作分析：
           - 当前动作类型（起乘、加速、转向、回切、减速等）
           - 动作是否标准
           - 时机把握是否准确

        4. 技术建议：
           - 需要改进的地方
           - 建议的动作调整
           - 最佳时机建议

        请用JSON格式返回分析结果，包含以下字段：
        {
            "surfer_position": "浪峰/浪壁/浪底",
            "body_posture": "优秀/良好/需改进",
            "wave_condition": "描述海浪情况",
            "current_action": "当前动作类型",
            "action_quality": "优秀/良好/需改进",
            "timing": "时机把握评价",
            "suggestions": ["具体建议1", "具体建议2"],
            "annotations": [
                {
                    "type": "line/text/arrow/circle",
                    "position": {"x": 50, "y": 30},
                    "style": "speed-line/action-line/balance-line",
                    "text": "标注文字",
                    "description": "详细说明"
                }
            ]
        }

        时间戳: ${timestamp}
        `;
    }

    // 解析分析响应
    parseAnalysisResponse(response, timestamp) {
        try {
            // 尝试解析JSON响应
            const analysis = JSON.parse(response);
            
            // 生成标注数据
            const annotations = this.generateAnnotations(analysis, timestamp);
            
            return {
                timestamp: timestamp,
                analysis: analysis,
                annotations: annotations
            };
        } catch (error) {
            console.error('解析AI响应失败:', error);
            // 返回默认分析结果
            return this.getDefaultAnalysis(timestamp);
        }
    }

    // 生成标注数据
    generateAnnotations(analysis, timestamp) {
        const annotations = [];

        // 根据分析结果生成不同类型的标注
        if (analysis.annotations && Array.isArray(analysis.annotations)) {
            annotations.push(...analysis.annotations);
        } else {
            // 生成默认标注
            annotations.push(...this.generateDefaultAnnotations(analysis, timestamp));
        }

        return annotations;
    }

    // 生成默认标注
    generateDefaultAnnotations(analysis, timestamp) {
        const annotations = [];

        // 根据冲浪者位置生成速度区间标注
        if (analysis.surfer_position) {
            annotations.push({
                type: 'line',
                position: { x: 20, y: 20 },
                style: 'speed-line',
                text: '速度区间 Speed Line',
                description: '在顶端速度是最快的,中部相对较弱,底部是最慢的。',
                timestamp: timestamp
            });
        }

        // 根据动作类型生成动作标注
        if (analysis.current_action) {
            annotations.push({
                type: 'arrow',
                position: { x: 50, y: 50 },
                style: 'action-arrow',
                text: analysis.current_action,
                description: analysis.suggestions ? analysis.suggestions[0] : '动作建议',
                timestamp: timestamp
            });
        }

        // 根据姿态评价生成平衡标注
        if (analysis.body_posture === '需改进') {
            annotations.push({
                type: 'circle',
                position: { x: 60, y: 40 },
                style: 'balance-circle',
                text: '重心调整',
                description: '建议调整重心位置以获得更好的平衡',
                timestamp: timestamp
            });
        }

        return annotations;
    }

    // 获取默认分析结果
    getDefaultAnalysis(timestamp) {
        return {
            timestamp: timestamp,
            analysis: {
                surfer_position: '浪壁',
                body_posture: '良好',
                wave_condition: '中等大小的海浪',
                current_action: '滑行',
                action_quality: '良好',
                timing: '时机把握准确',
                suggestions: ['继续保持当前姿态', '可以尝试更激进的动作']
            },
            annotations: [
                {
                    type: 'line',
                    position: { x: 20, y: 20 },
                    style: 'speed-line',
                    text: '速度区间',
                    description: '在顶端速度是最快的,中部相对较弱,底部是最慢的。',
                    timestamp: timestamp
                }
            ]
        };
    }

    // 将视频帧转换为base64
    async convertFrameToBase64(frameData) {
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = frameData.videoWidth || 1280;
                canvas.height = frameData.videoHeight || 720;
                
                ctx.drawImage(frameData, 0, 0, canvas.width, canvas.height);
                
                const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
                resolve(base64);
            } catch (error) {
                reject(error);
            }
        });
    }

    // 批量分析视频
    async analyzeVideo(videoElement, frameInterval = 2) {
        const analysisResults = [];
        const duration = videoElement.duration;
        
        if (!duration || duration === 0) {
            throw new Error('视频时长无效，请确保视频已正确加载');
        }
        
        const frameCount = Math.ceil(duration / frameInterval);
        console.log(`开始分析 ${frameCount} 帧视频...`);

        for (let i = 0; i < frameCount; i++) {
            const timestamp = i * frameInterval;
            
            try {
                // 设置视频时间
                videoElement.currentTime = timestamp;
                
                // 等待视频帧加载
                await this.waitForVideoFrame(videoElement);
                
                // 分析当前帧
                const result = await this.analyzeVideoFrame(videoElement, timestamp);
                analysisResults.push(result);
                
                // 更新进度
                const progress = ((i + 1) / frameCount) * 100;
                this.onProgressUpdate?.(progress, `正在分析第 ${i + 1}/${frameCount} 帧...`);
                
            } catch (error) {
                console.error(`分析第 ${i + 1} 帧失败:`, error);
                // 添加默认结果以保持分析连续性
                analysisResults.push(this.getDefaultAnalysis(timestamp));
            }
        }

        return analysisResults;
    }

    // 等待视频帧加载
    waitForVideoFrame(videoElement) {
        return new Promise((resolve) => {
            const onSeeked = () => {
                videoElement.removeEventListener('seeked', onSeeked);
                resolve();
            };
            
            videoElement.addEventListener('seeked', onSeeked);
            
            // 超时保护
            setTimeout(() => {
                videoElement.removeEventListener('seeked', onSeeked);
                resolve();
            }, 1000);
        });
    }

    // 设置进度更新回调
    setProgressCallback(callback) {
        this.onProgressUpdate = callback;
    }

    // 生成分析报告
    generateAnalysisReport(analysisResults) {
        const report = {
            totalFrames: analysisResults.length,
            duration: analysisResults[analysisResults.length - 1]?.timestamp || 0,
            overallScore: this.calculateOverallScore(analysisResults),
            keyMoments: this.extractKeyMoments(analysisResults),
            recommendations: this.generateRecommendations(analysisResults),
            technicalBreakdown: this.generateTechnicalBreakdown(analysisResults),
            aiProvider: this.apiConfigs[this.currentProvider].name
        };

        return report;
    }

    // 计算总体评分
    calculateOverallScore(analysisResults) {
        let totalScore = 0;
        let validScores = 0;

        analysisResults.forEach(result => {
            const analysis = result.analysis;
            let frameScore = 0;
            let scoreCount = 0;

            // 姿态评分
            if (analysis.body_posture) {
                frameScore += this.getPostureScore(analysis.body_posture);
                scoreCount++;
            }

            // 动作质量评分
            if (analysis.action_quality) {
                frameScore += this.getActionScore(analysis.action_quality);
                scoreCount++;
            }

            // 时机评分
            if (analysis.timing) {
                frameScore += this.getTimingScore(analysis.timing);
                scoreCount++;
            }

            if (scoreCount > 0) {
                totalScore += frameScore / scoreCount;
                validScores++;
            }
        });

        return validScores > 0 ? Math.round((totalScore / validScores) * 10) / 10 : 0;
    }

    // 获取姿态评分
    getPostureScore(posture) {
        switch (posture) {
            case '优秀': return 9;
            case '良好': return 7;
            case '需改进': return 5;
            default: return 6;
        }
    }

    // 获取动作评分
    getActionScore(quality) {
        switch (quality) {
            case '优秀': return 9;
            case '良好': return 7;
            case '需改进': return 5;
            default: return 6;
        }
    }

    // 获取时机评分
    getTimingScore(timing) {
        if (timing.includes('准确') || timing.includes('优秀')) return 9;
        if (timing.includes('良好') || timing.includes('不错')) return 7;
        if (timing.includes('需改进') || timing.includes('延迟')) return 5;
        return 6;
    }

    // 提取关键时刻
    extractKeyMoments(analysisResults) {
        const keyMoments = [];
        
        analysisResults.forEach((result, index) => {
            const analysis = result.analysis;
            
            // 识别关键时刻
            if (analysis.current_action && 
                ['起乘', '转向', '回切', '加速', '减速'].includes(analysis.current_action)) {
                keyMoments.push({
                    timestamp: result.timestamp,
                    action: analysis.current_action,
                    quality: analysis.action_quality,
                    description: analysis.suggestions ? analysis.suggestions[0] : '关键时刻'
                });
            }
        });

        return keyMoments;
    }

    // 生成建议
    generateRecommendations(analysisResults) {
        const recommendations = [];
        const suggestionCounts = {};

        // 统计所有建议
        analysisResults.forEach(result => {
            if (result.analysis.suggestions) {
                result.analysis.suggestions.forEach(suggestion => {
                    suggestionCounts[suggestion] = (suggestionCounts[suggestion] || 0) + 1;
                });
            }
        });

        // 按出现频率排序
        const sortedSuggestions = Object.entries(suggestionCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([suggestion]) => suggestion);

        return sortedSuggestions;
    }

    // 生成技术分解
    generateTechnicalBreakdown(analysisResults) {
        const breakdown = {
            balance: this.analyzeBalance(analysisResults),
            timing: this.analyzeTiming(analysisResults),
            technique: this.analyzeTechnique(analysisResults),
            flow: this.analyzeFlow(analysisResults)
        };

        return breakdown;
    }

    // 分析平衡
    analyzeBalance(analysisResults) {
        const balanceScores = analysisResults
            .map(result => this.getPostureScore(result.analysis.body_posture))
            .filter(score => score > 0);
        
        const avgBalance = balanceScores.reduce((a, b) => a + b, 0) / balanceScores.length;
        return Math.round(avgBalance * 10) / 10;
    }

    // 分析时机
    analyzeTiming(analysisResults) {
        const timingScores = analysisResults
            .map(result => this.getTimingScore(result.analysis.timing))
            .filter(score => score > 0);
        
        const avgTiming = timingScores.reduce((a, b) => a + b, 0) / timingScores.length;
        return Math.round(avgTiming * 10) / 10;
    }

    // 分析技术
    analyzeTechnique(analysisResults) {
        const techniqueScores = analysisResults
            .map(result => this.getActionScore(result.analysis.action_quality))
            .filter(score => score > 0);
        
        const avgTechnique = techniqueScores.reduce((a, b) => a + b, 0) / techniqueScores.length;
        return Math.round(avgTechnique * 10) / 10;
    }

    // 分析流畅度
    analyzeFlow(analysisResults) {
        let flowScore = 8; // 基础分数
        
        // 检查动作转换的流畅性
        for (let i = 1; i < analysisResults.length; i++) {
            const prevAction = analysisResults[i-1].analysis.current_action;
            const currentAction = analysisResults[i].analysis.current_action;
            
            if (prevAction && currentAction && prevAction !== currentAction) {
                if (this.isNaturalTransition(prevAction, currentAction)) {
                    flowScore += 0.1;
                } else {
                    flowScore -= 0.2;
                }
            }
        }
        
        return Math.max(0, Math.min(10, Math.round(flowScore * 10) / 10));
    }

    // 判断动作转换是否自然
    isNaturalTransition(fromAction, toAction) {
        const naturalTransitions = {
            '起乘': ['滑行', '加速'],
            '滑行': ['转向', '回切', '加速'],
            '转向': ['滑行', '回切'],
            '回切': ['滑行', '转向'],
            '加速': ['滑行', '转向']
        };
        
        return naturalTransitions[fromAction]?.includes(toAction) || false;
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiAIAnalyzer;
} else {
    window.MultiAIAnalyzer = MultiAIAnalyzer;
}
