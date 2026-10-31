# dsh-bili-scroll (DSHA 主权增强分支)

> **定位**: 本仓库是官方/社区 `dsh-bili-scroll` 的 DSHA 主权 Fork 分支（当前版本：`2.4.0-heart.1`）。在保留上游完整的 B 站视频搜索、字幕读取与自动报告能力的基础上，深度融入 **Heart Protocol v1** 微内核体系与 **接触表分镜 Token 极限压缩技术**。

---

## 🌟 主权魔改与核心增强

1. **接触表分镜技术 (Contact Sheet Storyboard)**：
   - 传统视频抽帧多为发送数张甚至数十张单图，动辄消耗几千视觉 Token。
   - 本分支集成单张时间码带编号宫格拼接技术，视频检视单次消耗锁定在 **384 tokens**，节省 **66% ~ 83%** 的 Token 开销，极大幅度降低端侧能耗与大模型 API 计费。
2. **Heart Protocol v1 微内核契约深度集成**：
   - **闲暇前置门控 (`evaluateActivity`)**：严格遵循小满心智的深度睡眠期与深夜静音期策略，避免深夜高负载巡检与打扰。
   - **交互经验回流 (`heart.observe`)**：巡检结果、私信互动与发现视频作为多模态感知事实回流至心智微内核。
3. **安全与巡检防护加固**：
   - 增加 `BILI_DUTY_DM_UID` 私信防护白名单，杜绝未授权 UID 滥用。
   - Prompt 动态时钟注入，保障时间线精准对齐。
4. **上游 v2.4.0 完整对齐**：
   - 合入社区 PR #150、PR #162 及稳定性补丁，测试用例全绿通过。

---

## 🛠️ 安装与使用

### PC 端一键构建与推送到手机
```bash
# 在 DSHA 根目录下执行
uv run python scripts/deploy_to_phone.py --plugin bili-scroll
```

### 手机端一键安装
```bash
sh /sdcard/dshproject/updates/install_or_update.sh
```

---

## 🙏 致谢与声明 (Acknowledgments)

- 特别感谢原作者及开源社区贡献者创建的卓越项目 [`dsh-bili-scroll`](https://github.com/omdsh-dev/dsh-bili-scroll)。
- 本项目遵循原项目的开源许可证进行分发与主权强化维护。
