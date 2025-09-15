// Enhanced Markdown Parser and Renderer
class MarkdownRenderer {
    constructor() {
        this.rules = {
            // Headers (with anchor links)
            h1: { pattern: /^# (.+)$/gm, replacement: '<h1 id="$1">$1</h1>' },
            h2: { pattern: /^## (.+)$/gm, replacement: '<h2 id="$1">$1</h2>' },
            h3: { pattern: /^### (.+)$/gm, replacement: '<h3 id="$1">$1</h3>' },
            h4: { pattern: /^#### (.+)$/gm, replacement: '<h4 id="$1">$1</h4>' },
            h5: { pattern: /^##### (.+)$/gm, replacement: '<h5 id="$1">$1</h5>' },
            h6: { pattern: /^###### (.+)$/gm, replacement: '<h6 id="$1">$1</h6>' },
            
            // Bold and Italic (with better handling)
            bold: { pattern: /\*\*(.+?)\*\*/g, replacement: '<strong>$1</strong>' },
            italic: { pattern: /\*(.+?)\*/g, replacement: '<em>$1</em>' },
            boldAlt: { pattern: /__(.+?)__/g, replacement: '<strong>$1</strong>' },
            italicAlt: { pattern: /_(.+?)_/g, replacement: '<em>$1</em>' },
            strikethrough: { pattern: /~~(.+?)~~/g, replacement: '<del>$1</del>' },
            
            // Code (enhanced with copy button)
            codeBlock: { pattern: /```(\w+)?\n([\s\S]*?)```/g, replacement: '<div class="code-block-container"><div class="code-header"><span class="language">$1</span><button class="copy-btn" onclick="navigator.clipboard.writeText(this.nextElementSibling.textContent)">Copy</button></div><pre><code class="language-$1">$2</code></pre></div>' },
            inlineCode: { pattern: /`([^`]+)`/g, replacement: '<code class="inline-code">$1</code>' },
            
            // Lists (enhanced with better nesting)
            unorderedList: { pattern: /^[\s]*[-*+] (.+)$/gm, replacement: '<li>$1</li>' },
            orderedList: { pattern: /^[\s]*\d+\. (.+)$/gm, replacement: '<li>$1</li>' },
            
            // Task lists
            taskList: { pattern: /^[\s]*[-*+] \[ \] (.+)$/gm, replacement: '<li class="task-item"><input type="checkbox" disabled> $1</li>' },
            taskListChecked: { pattern: /^[\s]*[-*+] \[x\] (.+)$/gm, replacement: '<li class="task-item"><input type="checkbox" checked disabled> $1</li>' },
            
            // Links (enhanced with better styling)
            links: { pattern: /\[([^\]]+)\]\(([^)]+)\)/g, replacement: '<a href="$2" target="_blank" rel="noopener noreferrer" class="external-link">$1 <i class="fas fa-external-link-alt"></i></a>' },
            autoLinks: { pattern: /(https?:\/\/[^\s]+)/g, replacement: '<a href="$1" target="_blank" rel="noopener noreferrer" class="auto-link">$1 <i class="fas fa-external-link-alt"></i></a>' },
            
            // Images (enhanced with lazy loading and better styling)
            images: { pattern: /!\[([^\]]*)\]\(([^)]+)\)/g, replacement: '<div class="image-container"><img src="$2" alt="$1" loading="lazy" class="markdown-image"><div class="image-caption">$1</div></div>' },
            
            // Blockquotes (enhanced with better styling)
            blockquotes: { pattern: /^> (.+)$/gm, replacement: '<blockquote class="markdown-blockquote">$1</blockquote>' },
            
            // Tables are handled by processTables method
            
            // Horizontal rules (enhanced)
            horizontalRule: { pattern: /^---$/gm, replacement: '<hr class="markdown-hr">' },
            horizontalRuleAlt: { pattern: /^\*\*\*$/gm, replacement: '<hr class="markdown-hr">' },
            horizontalRuleAlt2: { pattern: /^___$/gm, replacement: '<hr class="markdown-hr">' },
            
            // Line breaks (improved)
            lineBreaks: { pattern: /\n\n/g, replacement: '</p><p>' },
            singleLineBreaks: { pattern: /\n(?!\n)/g, replacement: '<br>' },
            
            // Emphasis combinations
            boldItalic: { pattern: /\*\*\*(.+?)\*\*\*/g, replacement: '<strong><em>$1</em></strong>' },
            boldItalicAlt: { pattern: /___(.+?)___/g, replacement: '<strong><em>$1</em></strong>' },
            
            // Subscript and Superscript
            subscript: { pattern: /~(.+?)~/g, replacement: '<sub>$1</sub>' },
            superscript: { pattern: /\^(.+?)\^/g, replacement: '<sup>$1</sup>' },
            
            // Highlight
            highlight: { pattern: /==(.+?)==/g, replacement: '<mark>$1</mark>' },
            
            // Keyboard keys
            keyboard: { pattern: /<kbd>(.+?)<\/kbd>/g, replacement: '<kbd class="keyboard-key">$1</kbd>' },
            
            // Abbreviations
            abbreviation: { pattern: /\*\[([^\]]+)\]: (.+)/g, replacement: '<abbr title="$2">$1</abbr>' }
        };
    }

    render(text) {
        if (!text) return '';
        
        // Escape HTML to prevent XSS
        let html = this.escapeHtml(text);
        
        // Process code blocks first (before other formatting)
        html = this.processCodeBlocks(html);
        
        // Process tables before other formatting
        html = this.processTables(html);
        
        // Process table-like structures that might not be in strict markdown format
        html = this.processTableLikeStructures(html);
        
        // Process task lists
        html = this.processTaskLists(html);
        
        // Process other markdown rules
        for (const [ruleName, rule] of Object.entries(this.rules)) {
            if (!['codeBlock', 'inlineCode', 'taskList', 'taskListChecked'].includes(ruleName)) {
                html = html.replace(rule.pattern, rule.replacement);
            }
        }
        
        // Process lists (wrap in ul/ol tags)
        html = this.processLists(html);
        
        // Process emphasis combinations (after basic bold/italic)
        html = this.processEmphasisCombinations(html);
        
        // Wrap in paragraphs
        html = this.wrapInParagraphs(html);
        
        // Add table of contents for headers
        html = this.addTableOfContents(html);
        
        return html;
    }

    processCodeBlocks(text) {
        // Process code blocks with enhanced features
        text = text.replace(this.rules.codeBlock.pattern, (match, language, code) => {
            const cleanCode = code.trim();
            const highlightedCode = this.highlightCode(cleanCode, language);
            return `<div class="code-block-container">
                <div class="code-header">
                    <span class="language">${language || 'text'}</span>
                    <button class="copy-btn" onclick="navigator.clipboard.writeText(this.nextElementSibling.textContent); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy', 2000)">
                        Copy
                    </button>
                </div>
                <pre><code class="language-${language || 'text'}">${highlightedCode}</code></pre>
            </div>`;
        });
        
        // Process inline code
        text = text.replace(this.rules.inlineCode.pattern, '<code class="inline-code">$1</code>');
        
        return text;
    }

    processTables(text) {
        // Enhanced table processing with multiple regex patterns
        const patterns = [
            // Standard markdown table format
            /^(\|.+\|)\s*\n(\|[-\s|]+\|)\s*\n((?:\|.+\|\s*\n?)*)/gm,
            // Tables without separator line (common in AI output)
            /^(\|.+\|)\s*\n((?:\|.+\|\s*\n?)+)/gm,
            // Tables with inconsistent spacing
            /^(\|.*\|)\s*\n(\|[\s\-|]+\|)\s*\n((?:\|.*\|\s*\n?)*)/gm
        ];
        
        let processedText = text;
        
        patterns.forEach((pattern, index) => {
            processedText = processedText.replace(pattern, (match, header, separator, rows) => {
                try {
                    console.log(`Table pattern ${index + 1} matched:`, match);
                    
                    // Parse header row
                    const headerCells = header.split('|')
                        .map(cell => cell.trim())
                        .filter(cell => cell.length > 0);
                    
                    if (headerCells.length === 0) return match;
                    
                    const headerHtml = `<thead><tr>${headerCells.map(cell => `<th>${cell}</th>`).join('')}</tr></thead>`;
                    
                    // Parse data rows
                    let rowLines = [];
                    if (rows) {
                        rowLines = rows.trim().split('\n')
                            .filter(line => line.trim().length > 0 && line.includes('|'));
                    } else if (separator && !separator.includes('-')) {
                        // If separator is actually data rows
                        rowLines = separator.split('\n')
                            .filter(line => line.trim().length > 0 && line.includes('|'));
                    }
                    
                    const bodyHtml = `<tbody>${rowLines.map(row => {
                        const cells = row.split('|')
                            .map(cell => cell.trim())
                            .filter(cell => cell.length > 0);
                        return `<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
                    }).join('')}</tbody>`;
                    
                    return `<div class="table-container">
                        <table class="markdown-table">
                            ${headerHtml}
                            ${bodyHtml}
                        </table>
                    </div>`;
                } catch (error) {
                    console.error('Table processing error:', error);
                    return match; // Return original text if processing fails
                }
            });
        });
        
        return processedText;
    }

    processTableLikeStructures(text) {
        // Handle table-like structures that might not be in strict markdown format
        // This is particularly useful for AI-generated content that might have inconsistent formatting
        
        // Pattern 1: Lines that look like table rows with | separators but no header separator
        const tableLikePattern = /((?:^.*\|.*$\n?)+)/gm;
        
        return text.replace(tableLikePattern, (match) => {
            const lines = match.trim().split('\n').filter(line => line.trim().length > 0);
            
            // Check if this looks like a table (multiple lines with | separators)
            if (lines.length < 2) return match;
            
            const hasMultiplePipes = lines.every(line => (line.match(/\|/g) || []).length >= 2);
            if (!hasMultiplePipes) return match;
            
            // Check if it's already been processed as a table
            if (match.includes('<table')) return match;
            
            try {
                // Parse the first line as header
                const headerCells = lines[0].split('|')
                    .map(cell => cell.trim())
                    .filter(cell => cell.length > 0);
                
                if (headerCells.length === 0) return match;
                
                const headerHtml = `<thead><tr>${headerCells.map(cell => `<th>${cell}</th>`).join('')}</tr></thead>`;
                
                // Parse remaining lines as data rows
                const dataLines = lines.slice(1);
                const bodyHtml = `<tbody>${dataLines.map(row => {
                    const cells = row.split('|')
                        .map(cell => cell.trim())
                        .filter(cell => cell.length > 0);
                    
                    // Ensure we have the same number of cells as header
                    while (cells.length < headerCells.length) {
                        cells.push('');
                    }
                    if (cells.length > headerCells.length) {
                        cells = cells.slice(0, headerCells.length);
                    }
                    
                    return `<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
                }).join('')}</tbody>`;
                
                return `<div class="table-container">
                    <table class="markdown-table">
                        ${headerHtml}
                        ${bodyHtml}
                    </table>
                </div>`;
            } catch (error) {
                console.error('Table-like structure processing error:', error);
                return match;
            }
        });
    }

    processTaskLists(text) {
        // Process task lists
        text = text.replace(this.rules.taskList.pattern, this.rules.taskList.replacement);
        text = text.replace(this.rules.taskListChecked.pattern, this.rules.taskListChecked.replacement);
        return text;
    }

    processEmphasisCombinations(text) {
        // Process bold+italic combinations
        text = text.replace(this.rules.boldItalic.pattern, this.rules.boldItalic.replacement);
        text = text.replace(this.rules.boldItalicAlt.pattern, this.rules.boldItalicAlt.replacement);
        return text;
    }

    addTableOfContents(text) {
        // Extract headers and create a table of contents
        const headerMatches = text.match(/<h[1-6][^>]*>(.+?)<\/h[1-6]>/g);
        if (!headerMatches || headerMatches.length < 2) return text;
        
        const toc = headerMatches.map(header => {
            const level = header.match(/<h(\d)/)[1];
            const title = header.replace(/<[^>]*>/g, '');
            const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return `<li class="toc-item toc-level-${level}"><a href="#${id}">${title}</a></li>`;
        }).join('');
        
        const tocHtml = `<div class="table-of-contents">
            <h4>Table of Contents</h4>
            <ul class="toc-list">${toc}</ul>
        </div>`;
        
        // Insert TOC after the first header
        const firstHeaderIndex = text.indexOf('<h');
        if (firstHeaderIndex !== -1) {
            const afterFirstHeader = text.indexOf('>', firstHeaderIndex) + 1;
            return text.slice(0, afterFirstHeader) + tocHtml + text.slice(afterFirstHeader);
        }
        
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

    // Enhanced syntax highlighting for multiple languages
    highlightCode(code, language) {
        if (!language) return this.escapeHtml(code);
        
        // Enhanced syntax highlighting for common languages
        const highlights = {
            javascript: this.highlightJavaScript,
            js: this.highlightJavaScript,
            typescript: this.highlightTypeScript,
            ts: this.highlightTypeScript,
            python: this.highlightPython,
            py: this.highlightPython,
            html: this.highlightHTML,
            css: this.highlightCSS,
            scss: this.highlightSCSS,
            sass: this.highlightSASS,
            json: this.highlightJSON,
            xml: this.highlightXML,
            sql: this.highlightSQL,
            bash: this.highlightBash,
            shell: this.highlightBash,
            sh: this.highlightBash,
            php: this.highlightPHP,
            java: this.highlightJava,
            cpp: this.highlightCpp,
            c: this.highlightC,
            csharp: this.highlightCSharp,
            cs: this.highlightCSharp,
            go: this.highlightGo,
            rust: this.highlightRust,
            ruby: this.highlightRuby,
            swift: this.highlightSwift,
            kotlin: this.highlightKotlin,
            dart: this.highlightDart,
            yaml: this.highlightYAML,
            yml: this.highlightYAML,
            markdown: this.highlightMarkdown,
            md: this.highlightMarkdown
        };
        
        const highlighter = highlights[language.toLowerCase()];
        return highlighter ? highlighter(code) : this.escapeHtml(code);
    }

    highlightJavaScript(code) {
        return code
            .replace(/\b(function|const|let|var|if|else|for|while|return|class|import|export|from|async|await|try|catch|finally|throw|new|this|super|extends|implements|interface|type|enum|namespace|module|declare|public|private|protected|static|readonly|abstract|override)\b/g, '<span class="keyword">$1</span>')
            .replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g, '<span class="literal">$1</span>')
            .replace(/\b\d+(\.\d+)?([eE][+-]?\d+)?\b/g, '<span class="number">$&</span>')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
            .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>')
            .replace(/\b(console|document|window|navigator|localStorage|sessionStorage|JSON|Math|Date|Array|Object|String|Number|Boolean|Promise|fetch|XMLHttpRequest)\b/g, '<span class="builtin">$1</span>');
    }

    highlightTypeScript(code) {
        return code
            .replace(/\b(function|const|let|var|if|else|for|while|return|class|import|export|from|async|await|try|catch|finally|throw|new|this|super|extends|implements|interface|type|enum|namespace|module|declare|public|private|protected|static|readonly|abstract|override|as|is|in|of|keyof|typeof|instanceof)\b/g, '<span class="keyword">$1</span>')
            .replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g, '<span class="literal">$1</span>')
            .replace(/\b\d+(\.\d+)?([eE][+-]?\d+)?\b/g, '<span class="number">$&</span>')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
            .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>')
            .replace(/\b(console|document|window|navigator|localStorage|sessionStorage|JSON|Math|Date|Array|Object|String|Number|Boolean|Promise|fetch|XMLHttpRequest)\b/g, '<span class="builtin">$1</span>')
            .replace(/\b(any|unknown|never|void|string|number|boolean|object|array|tuple|union|intersection|literal|optional|readonly)\b/g, '<span class="type">$1</span>');
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

    // Additional language highlighters
    highlightSCSS(code) {
        return code
            .replace(/([a-zA-Z-]+)(\s*{)/g, '<span class="selector">$1</span>$2')
            .replace(/([a-zA-Z-]+)(\s*:)/g, '<span class="property">$1</span>$2')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
            .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>')
            .replace(/\$[a-zA-Z-]+/g, '<span class="variable">$&</span>')
            .replace(/@[a-zA-Z-]+/g, '<span class="at-rule">$&</span>');
    }

    highlightSASS(code) {
        return this.highlightSCSS(code);
    }

    highlightXML(code) {
        return code
            .replace(/&lt;(\/?)([a-zA-Z][a-zA-Z0-9]*)/g, '&lt;$1<span class="tag">$2</span>')
            .replace(/([a-zA-Z-]+)=/g, '<span class="attr">$1</span>=')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
            .replace(/&lt;!--[\s\S]*?--&gt;/g, '<span class="comment">$&</span>');
    }

    highlightSQL(code) {
        return code
            .replace(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|DATABASE|INDEX|VIEW|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|BY|ORDER|HAVING|UNION|DISTINCT|LIMIT|OFFSET|CASE|WHEN|THEN|ELSE|END|IF|EXISTS|IN|NOT|NULL|AND|OR|AS|IS|BETWEEN|LIKE|REGEXP|MATCH|AGAINST)\b/gi, '<span class="keyword">$1</span>')
            .replace(/\b\d+(\.\d+)?\b/g, '<span class="number">$&</span>')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
            .replace(/(--.*$)/gm, '<span class="comment">$1</span>')
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
    }

    highlightBash(code) {
        return code
            .replace(/\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|local|export|readonly|declare|typeset|alias|unalias|set|unset|shift|getopts|trap|exit|break|continue|exec|eval|source|\.|cd|pwd|ls|cat|grep|sed|awk|cut|sort|uniq|head|tail|wc|find|xargs|chmod|chown|mkdir|rmdir|rm|cp|mv|ln|tar|gzip|gunzip|zip|unzip|wget|curl|ssh|scp|rsync|git|svn|hg|bzr|darcs|fossil|monotone|arch|tla|stgit|quilt|topgit|mercurial|bazaar|darcs|fossil|monotone|arch|tla|stgit|quilt|topgit)\b/g, '<span class="keyword">$1</span>')
            .replace(/\$[a-zA-Z_][a-zA-Z0-9_]*/g, '<span class="variable">$&</span>')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
            .replace(/(#.*$)/gm, '<span class="comment">$1</span>');
    }

    highlightPHP(code) {
        return code
            .replace(/\b(<?php|<?=|\?>|function|class|interface|trait|namespace|use|as|public|private|protected|static|abstract|final|const|var|if|else|elseif|endif|for|foreach|while|do|switch|case|default|break|continue|return|try|catch|finally|throw|new|clone|instanceof|and|or|xor|not|array|list|isset|empty|unset|echo|print|include|require|include_once|require_once|__construct|__destruct|__get|__set|__isset|__unset|__call|__callStatic|__sleep|__wakeup|__toString|__invoke|__set_state|__clone|__debugInfo)\b/g, '<span class="keyword">$1</span>')
            .replace(/\b(true|false|null|TRUE|FALSE|NULL)\b/g, '<span class="literal">$1</span>')
            .replace(/\b\d+(\.\d+)?\b/g, '<span class="number">$&</span>')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
            .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>')
            .replace(/\$[a-zA-Z_][a-zA-Z0-9_]*/g, '<span class="variable">$&</span>');
    }

    highlightJava(code) {
        return code
            .replace(/\b(public|private|protected|static|final|abstract|native|synchronized|transient|volatile|strictfp|package|import|class|interface|enum|extends|implements|throws|throw|try|catch|finally|if|else|switch|case|default|for|while|do|break|continue|return|new|this|super|instanceof|assert|const|goto|if|else|switch|case|default|for|while|do|break|continue|return|new|this|super|instanceof|assert|const|goto)\b/g, '<span class="keyword">$1</span>')
            .replace(/\b(true|false|null)\b/g, '<span class="literal">$1</span>')
            .replace(/\b\d+(\.\d+)?([eE][+-]?\d+)?[fFdDlL]?\b/g, '<span class="number">$&</span>')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
            .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
    }

    highlightCpp(code) {
        return code
            .replace(/\b(asm|auto|bool|break|case|catch|char|class|const|const_cast|continue|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|false|float|for|friend|goto|if|inline|int|long|mutable|namespace|new|operator|private|protected|public|register|reinterpret_cast|return|short|signed|sizeof|static|static_cast|struct|switch|template|this|throw|true|try|typedef|typeid|typename|union|unsigned|using|virtual|void|volatile|wchar_t|while)\b/g, '<span class="keyword">$1</span>')
            .replace(/\b(true|false|nullptr)\b/g, '<span class="literal">$1</span>')
            .replace(/\b\d+(\.\d+)?([eE][+-]?\d+)?[fFdDlL]?\b/g, '<span class="number">$&</span>')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
            .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
    }

    highlightC(code) {
        return this.highlightCpp(code);
    }

    highlightCSharp(code) {
        return code
            .replace(/\b(abstract|as|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|false|finally|fixed|float|for|foreach|goto|if|implicit|in|int|interface|internal|is|lock|long|namespace|new|null|object|operator|out|override|params|private|protected|public|readonly|ref|return|sbyte|sealed|short|sizeof|stackalloc|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|unchecked|unsafe|ushort|using|virtual|void|volatile|while|yield)\b/g, '<span class="keyword">$1</span>')
            .replace(/\b(true|false|null)\b/g, '<span class="literal">$1</span>')
            .replace(/\b\d+(\.\d+)?([eE][+-]?\d+)?[fFdDmM]?\b/g, '<span class="number">$&</span>')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
            .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
    }

    highlightGo(code) {
        return code
            .replace(/\b(break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go|goto|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/g, '<span class="keyword">$1</span>')
            .replace(/\b(true|false|nil|iota)\b/g, '<span class="literal">$1</span>')
            .replace(/\b\d+(\.\d+)?([eE][+-]?\d+)?\b/g, '<span class="number">$&</span>')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
            .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
    }

    highlightRust(code) {
        return code
            .replace(/\b(as|async|await|break|const|continue|crate|dyn|else|enum|extern|false|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|Self|static|struct|super|trait|true|type|union|unsafe|use|where|while|yield)\b/g, '<span class="keyword">$1</span>')
            .replace(/\b(true|false|None|Some|Ok|Err)\b/g, '<span class="literal">$1</span>')
            .replace(/\b\d+(\.\d+)?([eE][+-]?\d+)?\b/g, '<span class="number">$&</span>')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
            .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
    }

    highlightRuby(code) {
        return code
            .replace(/\b(alias|and|begin|break|case|class|def|defined|do|else|elsif|end|ensure|false|for|if|in|module|next|nil|not|or|redo|rescue|retry|return|self|super|then|true|undef|unless|until|when|while|yield)\b/g, '<span class="keyword">$1</span>')
            .replace(/\b(true|false|nil)\b/g, '<span class="literal">$1</span>')
            .replace(/\b\d+(\.\d+)?\b/g, '<span class="number">$&</span>')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
            .replace(/(#.*$)/gm, '<span class="comment">$1</span>')
            .replace(/\$[a-zA-Z_][a-zA-Z0-9_]*/g, '<span class="variable">$&</span>')
            .replace(/@[a-zA-Z_][a-zA-Z0-9_]*/g, '<span class="instance-variable">$&</span>');
    }

    highlightSwift(code) {
        return code
            .replace(/\b(associatedtype|class|deinit|enum|extension|fileprivate|func|import|init|inout|internal|let|open|operator|private|protocol|public|static|struct|subscript|typealias|var|break|case|continue|default|defer|do|else|fallthrough|for|guard|if|in|repeat|return|switch|where|while|as|catch|dynamicType|false|is|nil|rethrows|super|self|Self|throw|throws|true|try|associativity|convenience|dynamic|didSet|final|get|infix|indirect|lazy|left|mutating|none|nonmutating|optional|override|postfix|precedence|prefix|Protocol|required|right|set|Type|unowned|weak|willSet)\b/g, '<span class="keyword">$1</span>')
            .replace(/\b(true|false|nil)\b/g, '<span class="literal">$1</span>')
            .replace(/\b\d+(\.\d+)?\b/g, '<span class="number">$&</span>')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
            .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
    }

    highlightKotlin(code) {
        return code
            .replace(/\b(as|break|class|continue|do|else|false|for|fun|if|in|interface|is|null|object|package|return|super|this|throw|true|try|typealias|val|var|when|while|by|catch|constructor|delegate|dynamic|field|file|finally|get|import|init|param|property|receiver|set|setparam|where|actual|abstract|annotation|companion|crossinline|data|enum|external|final|infix|inline|inner|internal|lateinit|noinline|open|operator|out|override|private|protected|public|reified|sealed|suspend|tailrec|vararg|const|expect|value)\b/g, '<span class="keyword">$1</span>')
            .replace(/\b(true|false|null)\b/g, '<span class="literal">$1</span>')
            .replace(/\b\d+(\.\d+)?([eE][+-]?\d+)?[fFdDlL]?\b/g, '<span class="number">$&</span>')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
            .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
    }

    highlightDart(code) {
        return code
            .replace(/\b(abstract|as|assert|async|await|break|case|catch|class|const|continue|covariant|default|deferred|do|dynamic|else|enum|export|extends|extension|external|factory|false|final|finally|for|Function|get|hide|if|implements|import|in|interface|is|late|library|mixin|new|null|on|operator|part|required|rethrow|return|set|show|static|super|switch|sync|this|throw|true|try|typedef|var|void|while|with|yield|yield)\b/g, '<span class="keyword">$1</span>')
            .replace(/\b(true|false|null)\b/g, '<span class="literal">$1</span>')
            .replace(/\b\d+(\.\d+)?([eE][+-]?\d+)?\b/g, '<span class="number">$&</span>')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
            .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
    }

    highlightYAML(code) {
        return code
            .replace(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*):/gm, '$1<span class="key">$2</span>:')
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
            .replace(/\b(true|false|null|yes|no|on|off)\b/gi, '<span class="literal">$1</span>')
            .replace(/\b\d+(\.\d+)?\b/g, '<span class="number">$&</span>')
            .replace(/(#.*$)/gm, '<span class="comment">$1</span>');
    }

    highlightMarkdown(code) {
        return code
            .replace(/^#{1,6}\s+(.+)$/gm, '<span class="header">$&</span>')
            .replace(/\*\*(.+?)\*\*/g, '<span class="bold">$1</span>')
            .replace(/\*(.+?)\*/g, '<span class="italic">$1</span>')
            .replace(/`([^`]+)`/g, '<span class="code">$1</span>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<span class="link">$1</span>')
            .replace(/^[-*+]\s+(.+)$/gm, '<span class="list-item">$&</span>')
            .replace(/^\d+\.\s+(.+)$/gm, '<span class="list-item">$&</span>');
    }
}

// Initialize markdown renderer
const markdownRenderer = new MarkdownRenderer();

