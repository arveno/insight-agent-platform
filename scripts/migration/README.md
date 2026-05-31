# Migration Scripts

数据库 migration / seed 执行入口。

执行对象只能来自：

- `database/mysql/migrations`
- `database/mysql/seeds`

禁止执行未入库、未审查 SQL。Navicat 可以辅助执行已审查 SQL，但不能替代仓库事实源。
