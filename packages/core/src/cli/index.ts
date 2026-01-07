#!/usr/bin/env node

import { Command } from 'commander'

import { addCommand } from './commands/add'
import { buildCommand } from './commands/build'
import { initCommand } from './commands/init'
import { validateCommand } from './commands/validate'

const program = new Command()

program
  .name('coral')
  .description('Coral Design System CLI')
  .version('1.0.0')

program.addCommand(initCommand)
program.addCommand(validateCommand)
program.addCommand(buildCommand)
program.addCommand(addCommand)

program.parse(process.argv)
