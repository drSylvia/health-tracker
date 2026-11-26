## 发布新版本的标准流程
1. 开发新功能
正常修改 HTML、CSS、JS 文件

2. 本地测试
确认功能及 UI 正常

3.更新版本号
python release.py 1.0.4

4. 提交 Git
git add / commit / push

5. GitHub Pages 部署
自动发布

6. 打开或刷新网页
检查设置中的版本号



```
执行命令	自动生成版本
python release.py	V1.0.4
python release.py patch	V1.0.4
python release.py minor	V1.1.0
python release.py major	V2.0.0
python release.py status	查看当前版本
python release.py 1.5.0	手动指定 V1.5.0
```

