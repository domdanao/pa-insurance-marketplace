<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class MarkdownController extends Controller
{
    /**
     * Display a markdown file
     */
    public function show(Request $request, string $filename)
    {
        // Security: Only allow specific markdown files to be viewed
        $allowedFiles = [
            'human-testing-plan.md',
            'README.md',
            'CHANGELOG.md',
            'CONTRIBUTING.md',
            'LICENSE.md',
            'CLAUDE.md',
        ];

        if (! in_array($filename, $allowedFiles)) {
            abort(404, 'Markdown file not found');
        }

        $filePath = base_path($filename);

        if (! File::exists($filePath)) {
            abort(404, 'Markdown file not found');
        }

        $content = File::get($filePath);

        // Return raw markdown if requested
        if ($request->query('raw')) {
            return response($content)
                ->header('Content-Type', 'text/plain; charset=utf-8')
                ->header('Content-Disposition', 'inline; filename="'.$filename.'"');
        }

        return Inertia::render('Markdown/Show', [
            'content' => $content,
            'filename' => $filename,
            'title' => $this->getTitle($filename),
        ]);
    }

    /**
     * List available markdown files
     */
    public function index()
    {
        $files = collect([
            'human-testing-plan.md' => [
                'title' => 'Human Testing Plan',
                'description' => 'Comprehensive browser testing plan for the marketplace application',
                'icon' => 'test-tube',
                'color' => 'blue',
            ],
            'README.md' => [
                'title' => 'README',
                'description' => 'Project documentation and setup instructions',
                'icon' => 'book',
                'color' => 'green',
            ],
            'CHANGELOG.md' => [
                'title' => 'Changelog',
                'description' => 'Version history and changes',
                'icon' => 'clock',
                'color' => 'purple',
            ],
            'CONTRIBUTING.md' => [
                'title' => 'Contributing Guide',
                'description' => 'Guidelines for contributing to the project',
                'icon' => 'users',
                'color' => 'orange',
            ],
            'LICENSE.md' => [
                'title' => 'License',
                'description' => 'Project license information',
                'icon' => 'shield',
                'color' => 'gray',
            ],
            'CLAUDE.md' => [
                'title' => 'Claude Instructions',
                'description' => 'Development guidelines and conventions',
                'icon' => 'cog',
                'color' => 'indigo',
            ],
        ])->filter(function ($data, $filename) {
            unset($data); // Suppress unused parameter warning

            return File::exists(base_path($filename));
        });

        return Inertia::render('Markdown/Index', [
            'files' => $files,
        ]);
    }

    /**
     * Get a human-readable title for a markdown file
     */
    private function getTitle(string $filename): string
    {
        return match ($filename) {
            'human-testing-plan.md' => 'Human Testing Plan',
            'README.md' => 'README',
            'CHANGELOG.md' => 'Changelog',
            'CONTRIBUTING.md' => 'Contributing Guide',
            'LICENSE.md' => 'License',
            'CLAUDE.md' => 'Claude Instructions',
            default => str_replace(['.md', '-', '_'], ['', ' ', ' '], $filename),
        };
    }
}
