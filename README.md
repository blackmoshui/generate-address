# 多链助记词和地址生成器

这个工具可以批量生成多个区块链网络的助记词和对应地址。

## 支持的网络

目前支持以下网络:

- EVM (以太坊虚拟机)
- Bitcoin(Taproot)
- Bitcoin(Native)
- Celestia
- Atom (Cosmos)
- Solana
- Polkadot (DOT)

即将支持:
- TON

## 安装

1. 安装 NVM (Node Version Manager)
```sh
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
```
```sh
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```
2. 使用 NVM 安装 Node.js
```sh
nvm install 22
```
3. 安装 Yarn
```sh
npm install -g yarn
```

4. clone 本项目
```sh
git clone https://github.com/blackmoshui/generate-address.git && cd ./generate-address
```

## 使用方法

每次运行将批量生成100个地址,保存在keys文件夹下，evm地址会成为文件名
```sh
yarn new
```

如果您对代码进行了修改(例如增加新的地址类型),请运行:

```sh
yarn regen
```

## 关注更新

关注我的Twitter账号 [@blackmoushui](https://x.com/intent/follow?screen_name=blackmoshui)

## 贡献

如果您想为这个项目做出贡献或添加新的地址类型,请随时提交 Pull Request。