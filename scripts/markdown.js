// Simple Markdown Parser and Renderer
class MarkdownRenderer {
    constructor() {
        this.rules = {
            // Headers
            h1: { pattern: /^# (.+)$/gm, replacement: '<h1>$1</h1>' },
            h2: { pattern: /^## (.+)$/gm, replacement: '<h2>$1</h2>' },
            h3: { pattern: /^### (.+)$/gm, replacement: '<h3>$1</h3>' },
            h4: { pattern: /^#### (.+)$/gm, replacement: '<h4>$1</h4>' },
            h5: { pattern: /^##### (.+)$/gm, replacement: '<h5>$1</h5>' },
            h6: { pattern: /^###### (.+)$/gm, replacement: '<h6>$1</h6>' },
            
            // Bold and Italic
            bold: { pattern: /\*\*(.+?)\*\*/g, replacement: '<strong>$1</strong>' },
            italic: { pattern: /\*(.+?)\*/g, replacement: '<em>$1</em>' },
            boldAlt: { pattern: /__(.+?)__/g, replacement: '<strong>$1</strong>' },
            italicAlt: { pattern: /_(.+?)_/g, replacement: '<em>$1</em>' },
            
            // Code
            codeBlock: { pattern: /```(\w+)?\n([\s\S]*?)```/g, replacement: '<pre><code class="language-$1">$2</code></pre>' },
            inlineCode: { pattern: /`([^`]+)`/g, replacement: '<code>$1</code>' },
            
            // Lists
            unorderedList: { pattern: /^[\s]*[-*+] (.+)$/gm, replacement: '<li>$1</li>' },
            orderedList: { pattern: /^[\s]*\d+\. (.+)$/gm, replacement: '<li>$1</li>' },
            
            // Links
            links: { pattern: /\[([^\]]+)\]\(([^)]+)\)/g, replacement: '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>' },
            
            // Images
            images: { pattern: /!\[([^\]]*)\]\(([^)]+)\)/g, replacement: '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 0.5rem 0;">' },
            
            // Blockquotes
            blockquotes: { pattern: /^> (.+)$/gm, replacement: '<blockquote>$1</blockquote>' },
            
            // Horizontal rules
            horizontalRule: { pattern: /^---$/gm, replacement: '<hr>' },
            
            // Line breaks
            lineBreaks: { pattern: /\n\n/g, replacement: '</p><p>' },
            singleLineBreaks: { pattern: /\n(?!\n)/g, replacement: '<br>' }
        };
    }

    render(text) {
        if (!text) return '';
        
        // Escape HTML to prevent XSS
        let html = this.escapeHtml(text);
        
        // Process code blocks first (before other formatting)
        html = this.processCodeBlocks(html);
        
        // Process other markdown rules
        for (const [ruleName, rule] of Object.entries(this.rules)) {
            if (ruleName !== 'codeBlock' && ruleName !== 'inlineCode') {
                html = html.replace(rule.pattern, rule.replacement);
            }
        }
        
        // Process lists (wrap in ul/ol tags)
        html = this.processLists(html);
        
        // Wrap in paragraphs
        html = this.wrapInParagraphs(html);
        
        return html;
    }

    processCodeBlocks(text) {
        // Process code blocks
        text = text.replace(this.rules.codeBlock.pattern, this.rules.codeBlock.replacement);
        
        // Process inline code
        text = text.replace(this.rules.inlineCode.pattern, this.rules.inlineCode.replacement);
        
        return text;
    }

    processLists(text) {
        // Process unordered lists
        const ulMatches = text.match(/<li>.*?<\/li>/g);
        if (ulMatches) {
            const ulGroups = this.groupConsecutiveElements(text, ulMatches, 'ul');
            text = this.replaceGroups(text, ulGroups);
        }
        
        // Process ordered lists
        const olMatches = text.match(/<li>.*?<\/li>/g);
        if (olMatches) {
            const olGroups = this.groupConsecutiveElements(text, olMatches, 'ol');
            text = this.replaceGroups(text, olGroups);
        }
        
        return text;
    }

    groupConsecutiveElements(text, matches, tag) {
        const groups = [];
        let currentGroup = [];
        let lastIndex = -1;
        
        for (const match of matches) {
            const index = text.indexOf(match);
            if (index === lastIndex + 1 || currentGroup.length === 0) {
                currentGroup.push(match);
            } else {
                if (currentGroup.length > 0) {
                    groups.push({
                        start: text.indexOf(currentGroup[0]),
                        end: text.indexOf(currentGroup[currentGroup.length - 1]) + currentGroup[currentGroup.length - 1].length,
                        content: `<${tag}>${currentGroup.join('')}</${tag}>`
                    });
                }
                currentGroup = [match];
            }
            lastIndex = index;
        }
        
        if (currentGroup.length > 0) {
            groups.push({
                start: text.indexOf(currentGroup[0]),
                end: text.indexOf(currentGroup[currentGroup.length - 1]) + currentGroup[currentGroup.length - 1].length,
                content: `<${tag}>${currentGroup.join('')}</${tag}>`
            });
        }
        
        return groups;
    }

    replaceGroups(text, groups) {
        // Sort groups by start position in descending order to avoid index shifting
        groups.sort((a, b) => b.start - a.start);
        
        for (const group of groups) {
            text = text.substring(0, group.start) + group.content + text.substring(group.end);
        }
        
        return text;
    }

    wrapInParagraphs(text) {
        // Split by double line breaks and wrap each section in paragraphs
        const sections = text.split('</p><p>');
        return sections.map(section => {
            section = section.trim();
            if (!section) return '';
            
            // Don't wrap if it's already a block element
            if (section.match(/^<(h[1-6]|pre|blockquote|ul|ol|hr)/)) {
                return section;
            }
            
            return `<p>${section}</p>`;
        }).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Method to highlight code syntax (basic)
    highlightCode(code, language) {
        if (!language) return code;
        
        // Basic syntax highlighting for common languages
        const highlights = {
            javascript: this.highlightJavaScript,
            js: this.highlightJavaScript,
            python: this.highlightPython,
            py: this.highlightPython,
            html: this.highlightHTML,
            css: this.highlightCSS,
            json: this.highlightJSON
        };
        
        const highlighter = highlights[language.toLowerCase()];
        return highlighter ? highlighter(code) : code;
    }

    highlightJavaScript(code) {
        return code
            .replace(/\b(function|const|let|var|if|else|for|while|return|class|import|export|from|async|await)\b/g, '<span class="keyword">$1</span>')
            .replace(/\b(true|false|null|undefined)\b/g, '<span class="literal">$1</span>')
            .replace(/\b\d+\b/g, '<span class="number">$1</span>')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
            .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
    }

    highlightPython(code) {
        return code
            .replace(/\b(def|class|if|else|elif|for|while|return|import|from|as|try|except|finally|with|lambda)\b/g, '<span class="keyword">$1</span>')
            .replace(/\b(True|False|None)\b/g, '<span class="literal">$1</span>')
            .replace(/\b\d+\b/g, '<span class="number">$1</span>')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
            .replace(/(#.*$)/gm, '<span class="comment">$1</span>');
    }

    highlightHTML(code) {
        return code
            .replace(/&lt;(\/?)([a-zA-Z][a-zA-Z0-9]*)/g, '&lt;$1<span class="tag">$2</span>')
            .replace(/([a-zA-Z-]+)=/g, '<span class="attr">$1</span>=')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>');
    }

    highlightCSS(code) {
        return code
            .replace(/([a-zA-Z-]+)(\s*{)/g, '<span class="selector">$1</span>$2')
            .replace(/([a-zA-Z-]+)(\s*:)/g, '<span class="property">$1</span>$2')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>');
    }

    highlightJSON(code) {
        return code
            .replace(/(["'])([^"']+)\1(\s*:)/g, '<span class="key">$1$2$1</span>$3')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
            .replace(/\b(true|false|null)\b/g, '<span class="literal">$1</span>')
            .replace(/\b\d+\b/g, '<span class="number">$1</span>');
    }
}

// Initialize markdown renderer
const markdownRenderer = new MarkdownRenderer();
