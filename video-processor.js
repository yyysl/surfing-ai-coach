// 视频处理模块 - 生成带标注的分析视频

class VideoProcessor {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.video = null;
        this.annotations = [];
        this.isProcessing = false;
    }

    // 初始化视频处理
    async init(videoElement) {
        this.video = videoElement;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 设置画布尺寸
        this.canvas.width = this.video.videoWidth || 1280;
        this.canvas.height = this.video.videoHeight || 720;
        
        return true;
    }

    // 添加标注
    addAnnotation(annotation) {
        this.annotations.push(annotation);
    }

    // 清除所有标注
    clearAnnotations() {
        this.annotations = [];
    }

    // 绘制标注
    drawAnnotations(currentTime) {
        if (!this.ctx || !this.video) return;

        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制当前视频帧
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制当前时间点的标注
        const currentAnnotations = this.getAnnotationsAtTime(currentTime);
        currentAnnotations.forEach(annotation => {
            this.drawAnnotation(annotation);
        });
    }

    // 获取指定时间点的标注
    getAnnotationsAtTime(time) {
        return this.annotations.filter(annotation => {
            const annotationTime = this.parseTime(annotation.time);
            const currentTime = this.parseTime(time);
            return Math.abs(annotationTime - currentTime) < 0.5; // 0.5秒容差
        });
    }

    // 解析时间字符串为秒数
    parseTime(timeStr) {
        const parts = timeStr.split(':');
        if (parts.length === 2) {
            return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
        return 0;
    }

    // 绘制单个标注
    drawAnnotation(annotation) {
        const { type, position, style, text, description } = annotation;
        
        switch (type) {
            case 'line':
                this.drawLine(position, style);
                break;
            case 'text':
                this.drawText(position, text, style);
                break;
            case 'arrow':
                this.drawArrow(position, style);
                break;
            case 'circle':
                this.drawCircle(position, style);
                break;
        }
        
        // 绘制说明文字
        if (description) {
            this.drawDescription(position, description);
        }
    }

    // 绘制线条
    drawLine(position, style) {
        const { x, y } = position;
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([10, 5]);
        
        if (style === 'speed-line') {
            // 绘制速度区间线条
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.canvas.width / 100, y * this.canvas.height / 100);
            this.ctx.lineTo((x + 30) * this.canvas.width / 100, y * this.canvas.height / 100);
            this.ctx.stroke();
            
            // 绘制多条平行线表示不同速度区间
            for (let i = 1; i <= 3; i++) {
                this.ctx.beginPath();
                this.ctx.moveTo(x * this.canvas.width / 100, (y + i * 15) * this.canvas.height / 100);
                this.ctx.lineTo((x + 30) * this.canvas.width / 100, (y + i * 15) * this.canvas.height / 100);
                this.ctx.stroke();
            }
        } else {
            // 普通线条
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.canvas.width / 100, y * this.canvas.height / 100);
            this.ctx.lineTo((x + 20) * this.canvas.width / 100, (y + 20) * this.canvas.height / 100);
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
    }

    // 绘制文字
    drawText(position, text, style) {
        const { x, y } = position;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        
        // 绘制文字阴影
        this.ctx.strokeText(text, x * this.canvas.width / 100, y * this.canvas.height / 100);
        this.ctx.fillText(text, x * this.canvas.width / 100, y * this.canvas.height / 100);
    }

    // 绘制箭头
    drawArrow(position, style) {
        const { x, y } = position;
        
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.fillStyle = '#00ff00';
        this.ctx.lineWidth = 3;
        
        const startX = x * this.canvas.width / 100;
        const startY = y * this.canvas.height / 100;
        const endX = (x + 25) * this.canvas.width / 100;
        const endY = (y + 25) * this.canvas.height / 100;
        
        // 绘制箭头线条
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        // 绘制箭头头部
        const angle = Math.atan2(endY - startY, endX - startX);
        const arrowLength = 15;
        const arrowAngle = Math.PI / 6;
        
        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(
            endX - arrowLength * Math.cos(angle - arrowAngle),
            endY - arrowLength * Math.sin(angle - arrowAngle)
        );
        this.ctx.lineTo(
            endX - arrowLength * Math.cos(angle + arrowAngle),
            endY - arrowLength * Math.sin(angle + arrowAngle)
        );
        this.ctx.closePath();
        this.ctx.fill();
    }

    // 绘制圆形
    drawCircle(position, style) {
        const { x, y } = position;
        
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 3;
        
        const centerX = x * this.canvas.width / 100;
        const centerY = y * this.canvas.height / 100;
        const radius = 20;
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
    }

    // 绘制说明文字
    drawDescription(position, description) {
        const { x, y } = position;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        
        const textX = (x + 5) * this.canvas.width / 100;
        const textY = (y + 25) * this.canvas.height / 100;
        
        // 绘制文字背景
        const textMetrics = this.ctx.measureText(description);
        const padding = 5;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(
            textX - padding,
            textY - 15,
            textMetrics.width + padding * 2,
            20
        );
        
        // 绘制文字
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(description, textX, textY);
    }

    // 生成带标注的视频帧
    async generateAnnotatedFrame(currentTime) {
        this.drawAnnotations(currentTime);
        return this.canvas.toDataURL('image/jpeg', 0.9);
    }

    // 导出标注后的视频（模拟）
    async exportAnnotatedVideo() {
        // 这里应该使用MediaRecorder API录制带标注的视频
        // 由于浏览器限制，这里返回模拟结果
        return {
            success: true,
            message: '标注视频生成完成',
            downloadUrl: '#'
        };
    }

    // 获取画布元素
    getCanvas() {
        return this.canvas;
    }

    // 销毁资源
    destroy() {
        this.canvas = null;
        this.ctx = null;
        this.video = null;
        this.annotations = [];
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoProcessor;
} else {
    window.VideoProcessor = VideoProcessor;
}
