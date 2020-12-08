# 从零开始入门-Deno

## 来谈谈历史

Deno 是一个 JavaScript/TypeScript 的运行时，默认使用安全环境执行代码，有着卓越的开发体验。Deno 含有以下功能亮点：

1. 默认安全。外部代码没有文件系统、网络、环境的访问权限，除非显式开启。
2. 支持开箱即用的 TypeScript 的环境。
3. 只分发一个独立的可执行文件（deno）。
4. 有着内建的工具箱，比如一个依赖信息查看器（deno info）和一个代码格式化工具（deno fmt）。
5. 有一组经过审计的 标准模块，保证能在 Deno 上工作。
6. 脚本代码能被打包为一个单独的 JavaScript 文件。

#### Deno的组织架构图

随着时间的发展，Deno的组织架构也在随着迭代而变更,学习一门逐渐发展的新语言能让你更好的从宏观的角度去看待问题

## Deno 前期准备

### 安装

[Deno安装](https://deno.land/#installation)

### 基本概念了解

#### Deno标准模块

Deno提供了一组由核心团队审核的[标准模块](https://deno.land/std/)，并保证可以与Deno一起使用。
Deno的官方给出了对于标准模块的使用建议：
> 这些模块最终将根据Deno发行版进行标记，但是截至目前，我们还不认为它们是稳定的

不要链接到/导入任何路径如下的模块：

- 名称或父项带有下划线前缀：`_foo.ts，_util/bar.ts`。
- 那是一个测试模块或测试数据：`test.ts，foo_test.ts， testdata/bar.txt。`
- 请勿导入任何带有下划线前缀的符号`export function _baz() {}`。

*这些元素不被视为公共API的一部分，因此不能保证其稳定性*

#### Deno内建的工具箱

Deno提供了丰富的[工具箱函数](https://deno.land/manual@v1.5.4/tools)，包含脚本按照，代码格式化检查，生成JSDOC等丰富的功能，本文会随着对Deno的逐渐深入介绍需要用到的工具函数。

```javascript
# 格式化当前目录和子目录中的所有JS/TS文件
deno fmt
# 格式化特定文件
deno fmt file1.ts file2.ts
# 检查当前目录和子目录中的所有JS/TS文件是否都已格式化
deno fmt --check
# 检查ES模块及其所有依赖项
deno info [URL] 
```

### 开始着手你的第一个Hello Word

#### 起手先搭建一个HTTP服务

对于服务的搭建，Deno的标准库中给出了[Server](https://deno.land/std@0.79.0/http/server.ts)函数用于搭建一个简单的HTTP服务。从Deno的标准库中引入`listenAndServe`函数传入端口号以及对请求的处理函数。
```javascript
// server.ts
import { listenAndServe } from 'https://deno.land/std/http/server.ts'
listenAndServe({ port: 3000 }, async (req) => {
  if (req.method === 'GET' && req.url === '/') {
    req.respond({
      status: 200,
      headers: new Headers({
        'content-type': 'text/html',
      }),
      body: await Deno.open('./index.html'),
    })
  }
})
console.log('Server running on localhost:3000')
```
#### 浅析Server.ts

`Server` 组织树给出了需要了解的函数和类，listenAndServe用给定的选项和请求处理程序启动HTTP服务器,serve用于创建一个服务器,_parseAddrFromStr是一个工具函数用于从转化字符串为对象,Server 实现了异步的ServerRequest,这部分是Deno http 实现模块的精粹。这部分的内容会在deno模块分析中详细介绍。

```
Server.ts
├── listenAndServe
├── serve
├── Classes
│   ├── Server 
│   └── ServerRequest
│      
└── _parseAddrFromStr
```

```javascript
export async function listenAndServe(
  addr: string | HTTPOptions,
  handler: (req: ServerRequest) => void,
): Promise<void> {
  const server = serve(addr);

  for await (const request of server) {
    handler(request);
  }
}
```

`listenAndServe`方法传递了`addr`和`handler`。`addr`作为HTTP相关的配置选项, `handler`作为对`ServerRequest`请求对象的处理函数。

```javascript
export function serve(addr: string | HTTPOptions): Server {
  if (typeof addr === "string") {
    addr = _parseAddrFromStr(addr);
  }

  const listener = Deno.listen(addr);
  return new Server(listener);
}
```

`serve`方法传递`addr`,如果`addr`作为字符串传递,就调用`_parseAddrFromStr`方法把字符串转化成`HTTPOptions`对象。传递给[Deno.listen()](https://doc.deno.land/builtin/stable#Deno.listen)函数,`Deno.listen`作为全局的函数返回一个面向流协议的通用网络监听器作为参数传递给`Server`类的构造函数,得到的`Server`实例对象传递给 `for await of` 这个异步的迭代器, 迭代器会在Promise被resolved之后传递给`handler`处理函数。

```javascript
export class Server implements AsyncIterable<ServerRequest> {
  private closing = false;
  private connections: Conn[] = [];
  constructor(public listener: Listener) {}
  close(): void {}
  private async *iterateHttpRequests(conn: Conn):AsyncIterableIterator<ServerRequest> {}
  private trackConnection(conn: Conn): void {}
  private untrackConnection(conn: Conn): void {}
  private async *acceptConnAndIterateHttpRequests(mux: MuxAsyncIterator<ServerRequest>): AsyncIterableIterator<ServerRequest> {}
  [Symbol.asyncIterator](): AsyncIterableIterator<ServerRequest> {}
}
```
