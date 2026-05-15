// cloud/get-slogan/tc-signer.js
// TC3-HMAC-SHA256 签名器（简化版，无需额外npm包）
const crypto = require('crypto')

class TcSigner {
  constructor({secretId, secretKey, service, version, action}) {
    this.secretId = secretId
    this.secretKey = secretKey
    this.service = service
    this.version = version
    this.action = action
    this.timestamp = Math.floor(Date.now() / 1000).toString()
    this.nonce = crypto.randomBytes(8).toString('hex')
  }

  sign(method, uri, options = {}) {
    const {Body = ''} = options
    const bodyHash = crypto.createHash('sha256').update(Body || '').digest('hex')

    // 规范请求字符串
    const canonicalHeaders = [
      'content-type:application/json',
      'host:hunyuan.tencentcloudapi.com',
      `x-tc-action:${this.action.toLowerCase()}`,
      `x-tc-timestamp:${this.timestamp}`,
      `x-tc-nonce:${this.nonce}`,
      `x-tc-version:${this.version}`
    ].join('\n') + '\n'

    const signedHeaders = 'content-type;host;x-tc-action;x-tc-nonce;x-tc-timestamp;x-tc-version'

    const canonicalRequest = [
      method.toUpperCase(),
      uri || '/',
      '',
      canonicalHeaders,
      signedHeaders,
      bodyHash
    ].join('\n')

    // 计算日期签名
    const date = new Date(parseInt(this.timestamp) * 1000)
      .toISOString().split('T')[0]

    const credentialScope = `${date}/${this.service}/tc3_request`

    const stringToSign = [
      'TC3-HMAC-SHA256',
      this.timestamp,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    ].join('\n')

    // 计算签名密钥
    const kDate = crypto.createHmac('sha256', `TC3${this.secretKey}`)
      .update(date).digest()
    const kService = crypto.createHmac('sha256', kDate)
      .update(this.service).digest()
    const kSigning = crypto.createHmac('sha256', kService)
      .update('tc3_request').digest()
    const signature = crypto.createHmac('sha256', kSigning)
      .update(stringToSign).digest('hex')

    const auth = 'TC3-HMAC-SHA256 ' +
      `Credential=${this.secretId}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, ` +
      `Signature=${signature}`

    return {
      auth,
      timestamp: this.timestamp,
      nonce: this.nonce
    }
  }
}

module.exports = {TcSigner}