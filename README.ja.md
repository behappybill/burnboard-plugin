# BurnBoard Plugin for Claude Code

> Claude Code のトークン使用量を追跡し、グローバルリーダーボードで競い合おう。

**[burnboard.io](https://burnboard.io)**

[English](README.md) | [한국어](README.ko.md)

## クイックスタート

Claude Code 内で以下の3ステップを順番に実行してください。

### 1. マーケットプレイスの登録

BurnBoard プラグインリポジトリをマーケットプレイスとして登録します。

```bash
claude marketplace add https://github.com/behappybill/burnboard-plugin
```

### 2. プラグインのインストール

登録したマーケットプレイスから BurnBoard プラグインをインストールします。

```bash
claude plugin install burnboard
```

インストール中に hook の権限承認を求められる場合があります。許可してください。

### 3. セットアップ

Claude Code を起動し、以下のスラッシュコマンドを入力します。

```
/burnboard:setup
```

API キーの入力を求められます。[burnboard.io/settings](https://burnboard.io/settings) で GitHub ログイン後、API キーを発行して入力してください。

セットアップが完了すると、トークン使用量が自動的に追跡されます。

## 機能

- **自動追跡** — セットアップ後は設定不要。すべての Claude Code セッションが記録されます
- **ステータスライン HUD** — ターミナルのステータスバーにリアルタイムのトークン使用量、ティア、進捗が表示されます
- **ゼロオーバーヘッド** — Stop hook は純粋なシェルスクリプトで約 1ms で実行されます。Claude Code の応答速度に影響しません
- **オフライン対応** — 送信に失敗したレポートはローカルに保存され、次のセッションで再試行されます
- **バッチ送信** — 複数の保留中セッションを1回の API 呼び出しでまとめて送信します

## ステータスライン HUD

セットアップ完了後、ターミナルのステータスバーでリアルタイムのトークン使用量を確認できます。

```
🔶 Ember  1.8M/5.0M ██░░░░░░░░ 19%  │  Session: 84.2K
```

- **ティアアイコン & 名前** — 現在のティアに合わせた色で表示されます
- **月間トークン / 次のティア閾値** — 進捗を確認できます
- **プログレスバー** — 次のティアまでの視覚的な指標
- **セッショントークン** — 現在のセッションの使用量

ステータスラインは Claude Code の Statusline API を通じて、5秒キャッシュで自動更新されます。

## 仕組み

```
Claude Code セッション
       │
       ├─ [Stop イベント] ──→ mark.sh
       │                       セッション ID とトランスクリプトパスを保存
       │                       純粋シェル、~1ms、Node.js 起動なし
       │
       └─ [SessionEnd] ──→ flush.mjs
                             トランスクリプト JSONL を解析
                             モデルごとのトークン使用量を抽出
                             BurnBoard API へ報告
                             成功時にクリーンアップ
```

プラグインは2つの Claude Code hook を登録します。

| Hook | スクリプト | 役割 |
|------|------------|------|
| `Stop` | `mark.sh` | セッション ID とトランスクリプトパスを記録 (~1ms、純粋シェル) |
| `SessionEnd` | `flush.mjs` | トランスクリプト解析、トークン抽出、API 報告 |

すべての保留データは正常に送信されるまで `${CLAUDE_PLUGIN_DATA}` に保存されます。

## ティアシステム

毎月ランクを上げよう：

**Spark** (0) → **Ember** (100万) → **Flame** (500万) → **Blaze** (2000万) → **Inferno** (5000万) → **Supernova** (1億+)

## プライバシー

- 集計されたトークン数のみ送信されます（入力/出力トークン、モデル、ターン数、所要時間）
- 会話の内容は送信されません
- 設定からパブリックリーダーボードへの参加を無効にできます

## ローカル開発

```bash
claude --plugin-dir ./
```

## 関連プロジェクト

- **[burnboard](https://github.com/behappybill/burnboard)** — Web アプリ（ダッシュボード、リーダーボード、API）

## ライセンス

MIT
