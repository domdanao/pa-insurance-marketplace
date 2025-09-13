import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewerProps {
    content: string;
    fileName?: string;
    className?: string;
}

export default function MarkdownViewer({ content, fileName, className = '' }: MarkdownViewerProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className={`${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {fileName || 'Markdown Document'}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Markdown file viewer
                        </p>
                    </div>
                </div>

                <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Copy raw markdown to clipboard"
                >
                    {copied ? (
                        <>
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-green-600">Copied!</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="px-8 py-8 overflow-auto max-h-screen">
                <div className="markdown-body max-w-none font-medium">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            // Headings with GitHub-style spacing and borders
                            h1: ({ node, ...props }) => (
                                <h1 {...props} className="text-3xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700" />
                            ),
                            h2: ({ node, ...props }) => (
                                <h2 {...props} className="text-2xl font-semibold text-gray-900 dark:text-white mt-6 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700" />
                            ),
                            h3: ({ node, ...props }) => (
                                <h3 {...props} className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3" />
                            ),
                            h4: ({ node, ...props }) => (
                                <h4 {...props} className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2" />
                            ),
                            h5: ({ node, ...props }) => (
                                <h5 {...props} className="text-base font-semibold text-gray-900 dark:text-white mt-3 mb-2" />
                            ),
                            h6: ({ node, ...props }) => (
                                <h6 {...props} className="text-sm font-semibold text-gray-900 dark:text-white mt-3 mb-2" />
                            ),
                            
                            // Paragraphs with proper spacing
                            p: ({ node, ...props }) => (
                                <p {...props} className="text-gray-800 dark:text-gray-200 leading-relaxed mb-4 text-base" />
                            ),
                            
                            // Links with GitHub-style blue
                            a: ({ node, ...props }) => (
                                <a {...props} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline" />
                            ),
                            
                            // Strong/Bold text
                            strong: ({ node, ...props }) => (
                                <strong {...props} className="font-semibold text-gray-900 dark:text-white" />
                            ),
                            
                            // Emphasis/Italic text
                            em: ({ node, ...props }) => (
                                <em {...props} className="italic text-gray-700 dark:text-gray-300" />
                            ),
                            
                            // Lists with proper spacing
                            ul: ({ node, ...props }) => (
                                <ul {...props} className="list-disc pl-6 mb-4 space-y-1" />
                            ),
                            ol: ({ node, ...props }) => (
                                <ol {...props} className="list-decimal pl-6 mb-4 space-y-1" />
                            ),
                            li: ({ node, ...props }) => (
                                <li {...props} className="text-gray-800 dark:text-gray-200" />
                            ),
                            
                            // Task list items (checkboxes)
                            input: ({ node, ...props }) => {
                                if (props.type === 'checkbox') {
                                    return (
                                        <input
                                            {...props}
                                            className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-1"
                                        />
                                    );
                                }
                                return <input {...props} />;
                            },
                            
                            // Code blocks with GitHub-style styling
                            code: ({ node, inline, className, children, ...props }: any) => {
                                if (inline) {
                                    return (
                                        <code 
                                            {...props} 
                                            className="px-1.5 py-0.5 text-sm font-mono bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded border"
                                        >
                                            {children}
                                        </code>
                                    );
                                }
                                return (
                                    <div className="my-4">
                                        <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
                                            <code 
                                                {...props} 
                                                className="block p-4 text-sm font-mono text-gray-800 dark:text-gray-200"
                                            >
                                                {children}
                                            </code>
                                        </pre>
                                    </div>
                                );
                            },
                            
                            // Blockquotes with GitHub-style left border
                            blockquote: ({ node, ...props }) => (
                                <blockquote 
                                    {...props} 
                                    className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 text-gray-600 dark:text-gray-400 italic"
                                />
                            ),
                            
                            // Tables with GitHub-style borders and striping
                            table: ({ node, ...props }) => (
                                <div className="overflow-x-auto my-4">
                                    <table {...props} className="min-w-full border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden" />
                                </div>
                            ),
                            thead: ({ node, ...props }) => (
                                <thead {...props} className="bg-gray-50 dark:bg-gray-800" />
                            ),
                            th: ({ node, ...props }) => (
                                <th {...props} className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600" />
                            ),
                            tbody: ({ node, ...props }) => (
                                <tbody {...props} className="divide-y divide-gray-200 dark:divide-gray-700" />
                            ),
                            tr: ({ node, ...props }) => (
                                <tr {...props} className="hover:bg-gray-50 dark:hover:bg-gray-800/50" />
                            ),
                            td: ({ node, ...props }) => (
                                <td {...props} className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 border-r border-gray-200 dark:border-gray-700 last:border-r-0" />
                            ),
                            
                            // Horizontal rules
                            hr: ({ node, ...props }) => (
                                <hr {...props} className="my-8 border-t border-gray-300 dark:border-gray-600" />
                            ),
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}