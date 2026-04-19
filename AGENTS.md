# AGENTS.md

NestJS 11 製の REST API プロジェクトです。コーディング規約の詳細は `.cursor/rules/nestjs-conventions.mdc` を参照してください。

## クイックリファレンス

- **アプリディレクトリ**: `application/`（`npm` コマンドはここから実行する）
- **エントリポイント**: `src/main.ts` — Express、ポート `8000`、Swagger は `/api/docs`
- **`.env` の場所**: プロジェクトルート（`application/` の1つ上）
- **シード**: `npm run seed`
- **起動**: `npm run start:dev`
- **テスト**: `npm run test`

## 技術スタック

| レイヤー | ライブラリ |
|---------|-----------|
| フレームワーク | NestJS 11, Express 5 |
| ORM | TypeORM 0.3 + PostgreSQL |
| 認証 | Passport (JWT + Local), bcrypt |
| キュー | BullMQ + Redis |
| メッセージング | Kafka |
| 検索 | Elasticsearch (`@nestjs/elasticsearch`) |
| メール | `@nestjs-modules/mailer` + Handlebars |
| キャッシュ | ioredis |
| ドキュメント | Swagger (`@nestjs/swagger`) |

## インフラ（docker-compose）

- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Elasticsearch: `localhost:9200`
- Kafka UI: `localhost:8090`
