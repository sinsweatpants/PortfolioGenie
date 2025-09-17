#!/usr/bin/env node

/**
 * Development script for PortfolioGenie
 * Starts both frontend and backend in watch mode
 */

import { spawn } from 'child_process'

console.log('🚀 Starting PortfolioGenie in development mode...')

// Start backend
const backend = spawn('npm', ['run', 'dev:backend'], {
  stdio: 'inherit',
  shell: true
})

// Start frontend
const frontend = spawn('npm', ['run', 'dev:frontend'], {
  stdio: 'inherit',
  shell: true
})

// Handle process termination
const cleanup = () => {
  console.log('\n🛑 Shutting down...')
  backend.kill()
  frontend.kill()
  process.exit(0)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`)
  cleanup()
})

frontend.on('close', (code) => {
  console.log(`Frontend process exited with code ${code}`)
  cleanup()
})