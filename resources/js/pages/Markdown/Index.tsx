import { Head, Link } from '@inertiajs/react';
import { Book, Clock, Cog, Shield, TestTube, Users } from 'lucide-react';

interface MarkdownFile {
    title: string;
    description: string;
    icon: string;
    color: string;
}

interface Props {
    files: Record<string, MarkdownFile>;
}

const iconMap = {
    'test-tube': TestTube,
    book: Book,
    clock: Clock,
    users: Users,
    shield: Shield,
    cog: Cog,
};

const colorMap = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400',
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400',
};

export default function Index({ files }: Props) {
    return (
        <>
            <Head title="Documentation" />

            <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-12 text-center">
                        <div className="mb-4 flex items-center justify-center">
                            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                                <Book className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">Documentation</h1>
                        <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                            Browse and view markdown documentation files for the marketplace application.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="mb-8">
                        <nav className="flex items-center space-x-2 text-sm text-gray-500">
                            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300">
                                Home
                            </Link>
                            <span>→</span>
                            <span className="text-gray-900 dark:text-white">Documentation</span>
                        </nav>
                    </div>

                    {/* Files Grid */}
                    {Object.keys(files).length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(files).map(([filename, file]) => {
                                const IconComponent = iconMap[file.icon as keyof typeof iconMap] || Book;
                                const colorClasses = colorMap[file.color as keyof typeof colorMap] || colorMap.gray;

                                return (
                                    <Link
                                        key={filename}
                                        href={`/docs/${filename}`}
                                        className="group rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
                                    >
                                        <div className="p-6">
                                            <div className="mb-4 flex items-center">
                                                <div className={`rounded-lg p-2 ${colorClasses}`}>
                                                    <IconComponent className="h-5 w-5" />
                                                </div>
                                                <div className="ml-3 flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                                        {file.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{filename}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{file.description}</p>
                                        </div>
                                        <div className="dark:bg-gray-750 rounded-b-lg border-t border-gray-100 bg-gray-50 px-6 py-3 dark:border-gray-700">
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                <span>View document</span>
                                                <svg
                                                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                                <Book className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">No documentation files found</h3>
                            <p className="text-gray-600 dark:text-gray-400">There are no markdown files available to view at this time.</p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-12 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Documentation files are served securely from the project root directory.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
