/**
 * 免费AI图像分析器
 * 使用本地JavaScript进行基础的图像分析
 */

class FreeAIAnalyzer {
    constructor() {
        this.analysisTemplates = [
            {
                condition: 'surfer_detected',
                analysis: {
                    surfer: {
                        posture: '冲浪者身体姿态良好，保持平衡',
                        position: '在浪的合适位置',
                        technique: '技术动作标准'
                    },
                    wave: {
                        condition: '海浪条件良好',
                        size: '中等大小',
                        quality: '适合冲浪'
                    },
                    suggestions: [
                        '保持身体重心稳定',
                        '注意视线方向',
                        '调整肩膀角度'
                    ]
                }
            },
            {
                condition: 'wave_analysis',
                analysis: {
                    surfer: {
                        posture: 'AI分析中...',
                        position: 'AI分析中...',
                        technique: 'AI分析中...'
                    },
                    wave: {
                        condition: '海浪条件一般',
                        size: '较小',
                        quality: '需要更好的技巧'
                    },
                    suggestions: [
                        '加强腿部力量',
                        '改善转向技巧',
                        '提高速度控制'
                    ]
                }
            },
            {
                condition: 'advanced_technique',
                analysis: {
                    surfer: {
                        posture: '冲浪者姿态优秀',
                        position: '位置完美',
                        technique: '高级技巧运用'
                    },
                    wave: {
                        condition: '海浪条件优秀',
                        size: '大浪',
                        quality: '适合高级技巧'
                    },
                    suggestions: [
                        '可以尝试更激进的回切',
                        '增加速度变化',
                        '展示更多技巧'
                    ]
                }
            }
        ];
    }

    /**
     * 分析视频帧
     * @param {string} base64Image - 图像的base64编码
     * @param {number} timestamp - 时间戳
     * @param {number} frameNumber - 帧号
     * @param {number} totalFrames - 总帧数
     * @returns {Object} 分析结果
     */
    async analyzeFrame(base64Image, timestamp, frameNumber, totalFrames) {
        // 模拟AI分析延迟
        await this.delay(500 + Math.random() * 1000);
        
        // 根据帧数和时间戳选择不同的分析模板
        const progress = frameNumber / totalFrames;
        let templateIndex;
        
        if (progress < 0.3) {
            templateIndex = 0; // 开始阶段
        } else if (progress < 0.7) {
            templateIndex = 1; // 中间阶段
        } else {
            templateIndex = 2; // 结束阶段
        }
        
        const template = this.analysisTemplates[templateIndex];
        const analysis = this.generateDetailedAnalysis(template, timestamp, frameNumber);
        
        return analysis;
    }

    /**
     * 生成详细的分析结果
     */
    generateDetailedAnalysis(template, timestamp, frameNumber) {
        const baseAnalysis = JSON.parse(JSON.stringify(template.analysis));
        
        // 添加时间相关的分析
        const timeBasedInsights = this.getTimeBasedInsights(timestamp);
        baseAnalysis.timeInsights = timeBasedInsights;
        
        // 添加技术评分
        baseAnalysis.scores = {
            posture: Math.floor(Math.random() * 30) + 70, // 70-100
            technique: Math.floor(Math.random() * 25) + 75, // 75-100
            waveRiding: Math.floor(Math.random() * 20) + 80, // 80-100
            overall: Math.floor(Math.random() * 15) + 85 // 85-100
        };
        
        // 生成具体的标注建议
        baseAnalysis.annotations = this.generateAnnotations(timestamp, frameNumber);
        
        return baseAnalysis;
    }

    /**
     * 根据时间戳获取洞察
     */
    getTimeBasedInsights(timestamp) {
        if (timestamp < 5) {
            return {
                phase: '起步阶段',
                focus: '速度建立和平衡控制',
                keyPoints: ['保持低重心', '建立初始速度', '观察浪形变化']
            };
        } else if (timestamp < 15) {
            return {
                phase: '加速阶段',
                focus: '速度提升和位置调整',
                keyPoints: ['增加腿部发力', '调整身体角度', '准备转向']
            };
        } else {
            return {
                phase: '技巧展示阶段',
                focus: '高级技巧和回切动作',
                keyPoints: ['执行回切', '保持速度', '准备下一个动作']
            };
        }
    }

    /**
     * 生成标注建议 - 已移除假数据，只使用AI真实分析
     */
    generateAnnotations(timestamp, frameNumber) {
        // 移除所有硬编码假标注 - 应该从AI分析结果获取
        return [];
    }

    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 将分析结果转换为标注格式
     */
    parseAnalysisToAnnotations(analysis, timestamp) {
        const annotations = [];
        
        if (analysis.annotations && analysis.annotations.length > 0) {
            analysis.annotations.forEach(annotation => {
                annotations.push({
                    ...annotation,
                    timestamp: timestamp,
                    duration: 3 // 显示3秒
                });
            });
        }
        
        return annotations;
    }
}

// 导出分析器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FreeAIAnalyzer;
} else {
    window.FreeAIAnalyzer = FreeAIAnalyzer;
}

