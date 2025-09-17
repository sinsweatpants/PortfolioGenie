#!/usr/bin/env node

/**
 * Build script for PortfolioGenie
 * Builds both frontend and backend applications
 */

import { execSync } from 'child_process'
import { existsSync, rmSync } from 'fs'

console.log('🚀 Building PortfolioGenie...')

// Clean previous build
if (existsSync('dist')) {
  console.log('🧹 Cleaning previous build...')
  rmSync('dist', { recursive: true, force: true })
}

try {
  // Build frontend
  console.log('📦 Building frontend...')
  execSync('npm run build:frontend', { stdio: 'inherit' })

  // Build backend
  console.log('⚙️ Building backend...')
  execSync('npm run build:backend', { stdio: 'inherit' })

  console.log('✅ Build completed successfully!')
} catch (error) {
  console.error('❌ Build failed:', error.message)
  process.exit(1)
}