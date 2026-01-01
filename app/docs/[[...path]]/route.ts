/**
 * Catch-all route for /docs/*
 * 
 * Serves the built VitePress documentation from public/docs.
 * This route handles all /docs/* paths and serves the corresponding
 * static files from the public/docs directory.
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  try {
    const { path } = await params;
    const pathSegments = path || [];
    let filePath = pathSegments.join('/');
    
    // Default to index.html if no path
    if (!filePath || filePath === '') {
      filePath = 'index.html';
    }
    
    // Add .html extension if not present (for VitePress routes)
    if (!filePath.includes('.') && !filePath.endsWith('/')) {
      filePath = `${filePath}.html`;
    }
    
    // Remove leading slash
    filePath = filePath.replace(/^\//, '');
    
    // Construct full path to public/docs
    const fullPath = join(process.cwd(), 'public', 'docs', filePath);
    
    // Security: prevent directory traversal
    const publicDocsPath = join(process.cwd(), 'public', 'docs');
    if (!fullPath.startsWith(publicDocsPath)) {
      return new NextResponse('Not Found', { status: 404 });
    }
    
    // Try to read the file
    try {
      const fileContent = await readFile(fullPath);
      
      // Determine content type
      let contentType = 'text/html';
      if (filePath.endsWith('.js')) {
        contentType = 'application/javascript';
      } else if (filePath.endsWith('.css')) {
        contentType = 'text/css';
      } else if (filePath.endsWith('.json')) {
        contentType = 'application/json';
      } else if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        contentType = `image/${filePath.split('.').pop()}`;
      } else if (filePath.endsWith('.svg')) {
        contentType = 'image/svg+xml';
      } else if (filePath.endsWith('.woff2')) {
        contentType = 'font/woff2';
      }
      
      return new NextResponse(fileContent, {
        headers: {
          'Content-Type': contentType,
        },
      });
    } catch (error) {
      // File not found, try index.html for directory requests
      if (filePath.endsWith('/') || !filePath.includes('.')) {
        const indexPath = join(process.cwd(), 'public', 'docs', 'index.html');
        try {
          const indexContent = await readFile(indexPath);
          return new NextResponse(indexContent, {
            headers: {
              'Content-Type': 'text/html',
            },
          });
        } catch {
          return new NextResponse('Not Found', { status: 404 });
        }
      }
      return new NextResponse('Not Found', { status: 404 });
    }
  } catch (error) {
    console.error('Error serving docs:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

