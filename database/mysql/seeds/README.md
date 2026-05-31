# MySQL Seeds

本目录存放初始化数据和演示数据 SQL。

Seed SQL 必须基于已审查的 Issue 入库，执行对象必须匹配 `database/mysql/migrations` 中已经建立的结构。

禁止在业务代码中硬编码 seed 数据，禁止把 seed 数据当成 Mock / Real 双链路。
