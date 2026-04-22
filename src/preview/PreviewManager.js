/**
 * 预览管理器
 * 
 * 使用playwright-browser-automation技能在浏览器中预览生成的互动学习内容。
 * 支持HTML和Twine格式的预览，提供自动化验证和用户体验测试。
 */

const fs = require('fs-extra');
const path = require('path');

class PreviewManager {
  /**
   * 在浏览器中预览生成的内容
   * @param {string} outputPath - 输出文件路径（HTML或Twine HTML）
   * @param {string} tempDir - 临时目录路径
   * @param {Object} context - WorkBuddy技能上下文
   * @returns {Promise<string>} 预览URL或本地文件路径
   */
  static async preview(outputPath, tempDir, context) {
    console.log(`开始预览：${outputPath}`);
    
    // 验证文件存在
    if (!await fs.pathExists(outputPath)) {
      throw new Error(`输出文件不存在：${outputPath}`);
    }
    
    const ext = path.extname(outputPath).toLowerCase();
    const isHtml = ext === '.html' || ext === '.htm';
    const isTwine = outputPath.includes('twine') || outputPath.includes('story');
    
    if (!isHtml && !isTwine) {
      console.log(`不支持预览格式 ${ext}，跳过预览`);
      return null;
    }
    
    try {
      // 调用playwright-browser-automation技能打开浏览器预览
      const previewResult = await context.useSkill('playwright-browser-automation', {
        action: 'open',
        url: `file://${outputPath}`,
        options: {
          headless: false,
          viewport: { width: 1280, height: 720 },
          takeScreenshot: true,
          screenshotPath: path.join(tempDir, 'preview-screenshot.png')
        }
      });
      
      // 返回预览URL或文件路径
      return previewResult.url || `file://${outputPath}`;
      
    } catch (error) {
      console.error(`浏览器预览失败：${error.message}`);
      
      // 如果playwright技能不可用，尝试使用系统默认浏览器打开
      try {
        const { exec } = require('child_process');
        const openCommand = process.platform === 'win32' 
          ? `start "" "${outputPath}"`
          : process.platform === 'darwin'
            ? `open "${outputPath}"`
            : `xdg-open "${outputPath}"`;
        
        await new Promise((resolve, reject) => {
          exec(openCommand, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        
        console.log(`已使用系统默认浏览器打开：${outputPath}`);
        return `file://${outputPath}`;
        
      } catch (fallbackError) {
        console.error(`系统浏览器打开也失败：${fallbackError.message}`);
        return null;
      }
    }
  }
  
  /**
   * 验证互动功能
   * @param {string} outputPath - 输出文件路径
   * @param {Object} context - WorkBuddy技能上下文
   * @returns {Promise<Object>} 验证结果
   */
  static async validateInteractiveFeatures(outputPath, context) {
    console.log(`验证互动功能：${outputPath}`);
    
    try {
      // 使用playwright技能进行自动化测试
      const validationResult = await context.useSkill('playwright-browser-automation', {
        action: 'test',
        url: `file://${outputPath}`,
        tests: [
          {
            name: '页面加载',
            steps: [
              { action: 'waitForSelector', selector: 'body', timeout: 5000 }
            ]
          },
          {
            name: '互动元素检测',
            steps: [
              { action: 'waitForSelector', selector: 'button, .interactive, [onclick]', timeout: 3000 }
            ]
          },
          {
            name: '导航测试',
            steps: [
              { action: 'click', selector: 'button:first-of-type' },
              { action: 'waitForNavigation', timeout: 2000 }
            ]
          }
        ]
      });
      
      return {
        success: true,
        results: validationResult.results || [],
        screenshot: validationResult.screenshot
      };
      
    } catch (error) {
      console.error(`互动功能验证失败：${error.message}`);
      return {
        success: false,
        error: error.message,
        results: []
      };
    }
  }
  
  /**
   * 生成预览报告
   * @param {string} outputPath - 输出文件路径
   * @param {string} tempDir - 临时目录路径
   * @param {Object} validationResult - 验证结果
   * @returns {Promise<string>} 报告文件路径
   */
  static async generatePreviewReport(outputPath, tempDir, validationResult) {
    const reportPath = path.join(tempDir, 'preview-report.md');
    
    const reportContent = `# 互动学习内容预览报告

## 基本信息
- **生成时间**：${new Date().toISOString()}
- **输出文件**：${outputPath}
- **文件大小**：${(await fs.stat(outputPath)).size} 字节

## 验证结果
${validationResult.success ? '✅ 所有测试通过' : '❌ 测试失败'}

${validationResult.results && validationResult.results.length > 0 
  ? `### 详细测试结果
${validationResult.results.map((test, idx) => `
#### ${idx + 1}. ${test.name}
- **状态**：${test.passed ? '✅ 通过' : '❌ 失败'}
- **耗时**：${test.duration || '未知'}ms
${test.error ? `- **错误**：${test.error}` : ''}
`).join('')}`
  : '### 未执行详细测试'
}

## 截图
![预览截图](preview-screenshot.png)

## 建议
${validationResult.success 
  ? '内容互动功能正常，可以交付使用。'
  : '部分互动功能可能存在问题，建议检查生成逻辑。'
}

---

*报告由互动学习生成器自动生成*`;

    await fs.writeFile(reportPath, reportContent, 'utf-8');
    return reportPath;
  }
}

module.exports = PreviewManager;