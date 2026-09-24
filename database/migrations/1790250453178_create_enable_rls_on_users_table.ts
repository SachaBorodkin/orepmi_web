import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw('ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;')
  }

  async down() {
    this.schema.raw('ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;')
  }
}