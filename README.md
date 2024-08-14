# ns-mfe-cli

ns-mfe cli工具

```
yarn add ns-mfe-cli --dev
```

## ns-mfe-cli deploy

将gitlab上的apps部署到目标目录，要求app项目里有对应的build tar包

```
ns-mfe-cli deploy 配置文件
```

## 配置文件

示例

```
{
  "token": "",
  "apps": [
    {
      "name": "test",
      "projectId": 1
    }
  ]
}
```

* token: gitlab Project Access Tokens
* sourceServer: gitlab地址
* targetDir?: 部署目录，默认build/apps
* apps
  * name: app目录名
  * projectId: gitlab上项目ID
  * branch?: 代码分支，默认master
  * tar?: build文件压缩包，默认build.tar.gz
