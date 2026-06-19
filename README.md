# 4D Plotter

在浏览器里绘制嵌入 **R⁴** 的拓扑空间：参数化 → 4D 旋转 → 投影到 R³ → three.js 渲染。

```bash
npm install
npm run dev    # 打开 http://localhost:5173
```

## 已内置的拓扑空间

| 曲面 | 拓扑故事 | 参数化 |
| --- | --- | --- |
| 克莱因瓶 K² | 不可定向，不嵌入 R³，但无自交地嵌入 R⁴ | 环面圆 × zw 平面内的半角旋转截面 |
| Clifford 平环面 T² | S³ 上的平坦环面，内蕴曲率为零 | `(cos u, sin u, cos v, sin v)/√2` |
| 实射影平面 RP² | 球面对径点粘合的商空间 | Veronese 映射 `(xy, xz, yz, (x²−y²)/2)` |
| 复抛物面 w = z² | C² ≅ R⁴ 中的黎曼面，分支在 4D 中光滑一片 | `(u, v, u²−v², 2uv)` |

## 管线

1. **采样**：`Surface4D.evaluate(u, v)` 在参数网格上生成 R⁴ 点阵（`src/surfaces/`）。
2. **4D 旋转**：SO(4) 有六个独立旋转平面 `xy, xz, xw, yz, yw, zw`，按固定顺序合成旋转矩阵（`src/math/vec4.ts`）。含 w 的三个平面是真正的"第四维旋转"。
3. **投影 R⁴ → R³**（`src/math/projection.ts`）：
   - **透视**：4D 相机位于 `(0,0,0,d)`，缩放因子 `d/(d−w)`；
   - **球极**：从每点所在球面的北极投影，对 S³ 上的曲面（Clifford 环面）是经典球极投影——旋转时环面会翻穿无穷远；
   - **正交**：直接丢掉 w。
4. **渲染**：每帧重写顶点位置，按旋转后的 w 坐标着色（青 → 品红），让第四维"深度"直接可见（`src/render/mesh.ts`）。

鼠标拖拽控制的是投影后 R³ 中的普通 3D 相机（OrbitControls），与 4D 旋转互不干扰。

## 添加新曲面

1. 在 `src/surfaces/` 新建文件，实现 `Surface4D` 接口（参数域、网格密度、`evaluate`、默认投影）；
2. 在 `src/surfaces/registry.ts` 的数组里加一行。

候选清单：Hopf 环面（Pinkall，S² 上闭曲线在 Hopf 纤维化下的原像）、三维环面 T³、tiger 等 toratope 家族、更多复函数图像（`e^z`、Fermat 曲线 `zⁿ+wⁿ=1`）。
