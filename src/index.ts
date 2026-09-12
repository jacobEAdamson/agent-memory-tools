#!/usr/bin/env node
import { Command } from 'commander';
import { lintCommand } from './commands/lint.js';

const program = new Command()
  .name('agent-memory-tools')
  .description('Validate and maintain agent memory files')
  .version('1.0.0')
  .addCommand(lintCommand());

program.parse(process.argv);