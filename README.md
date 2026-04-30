# Lenovo Accessories Dashboard

静态 Lenovo 产品数据可视化 dashboard，面向 GitHub Pages 部署：

- 原生 HTML + CSS + JavaScript
- Plotly.js 前端渲染图表
- 零后端，页面只读取 `data/*.json`
- Python 脚本负责把源数据或拟合数据更新成静态 JSON

## 页面结构

- 主界面：选择 `Adapter`、`Power Bank`、`Power Cable`
- 品类界面：包含市场分析、竞品分析、品类总览、产品列表四个平行页面
- 品类总览：按 model 对比销量、收入、利润、margin、return rate，并包含产品矩阵
- 单品界面：按 `Market`、`Product`、`Supply Chain`、`User Reviews` 四个维度查看详情
- 时间粒度：月、季度、年
- 单品版型：支持 All variants 和单一 variant 对比

## 数据结构

`data/` 目录拆分为：

- `catalog.json`：品类、产品、variant、筛选项
- `product_metrics.json`：销量、退货、收入、利润、成本、margin
- `market_metrics.json`：市场份额、市场规模、搜索指数、价格指数
- `brand_market_metrics.json`：Lenovo 与竞品品牌的份额、出货、新品和明星产品
- `supply_chain.json`：组件、供应商、价格指数、交付周期、产能利用率
- `consumer_insights.json`：评价关键词、情绪、频率、评分
- `metadata.json`：生成时间、记录数、源数据说明

## 本地运行

```bash
python3 -m http.server 8000
```

然后打开：

```text
http://localhost:8000
```

## 更新数据

当前数据使用提供的 workbook 时间节奏和字段结构进行拟合：

```bash
python3 scripts/generate_dashboard_data.py \
  --source-xlsx "/Users/albert/Desktop/zhenqi_li homework 2/lenovo_wearables_final.xlsx" \
  --output-dir data
```

后续接入真实爬虫或 API 时，保持 `data/*.json` 字段合同不变，页面不用重写。

## GitHub Pages

把仓库部署到 GitHub Pages 后，入口文件是：

```text
index.html
```

`.github/workflows/update-dashboard-data.yml` 提供了每日定时更新模板。
