const cloud = require('wx-server-sdk')
cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database()

// MiniMax API 配置（通过环境变量注入）
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || ''
const MINIMAX_MODEL = 'MiniMax-Text-01'
const MINIMAX_BASE_URL = 'https://api.minimaxi.com/anthropic/v1/messages'

// System prompt：客服身份，不输出健康类专业结论
const SYSTEM_PROMPT = `你是「NoForget」小程序的智能客服助手，名字叫「小诺」。

你的定位：
- 用户的贴心助手，能回答任何与用户生活相关的问题
- 用户建立了各种纪念日/倒计时，你可以帮助用户解答与此相关的问题

你的能力范围：
- 回答用户关于礼物、庆祝方式、时间规划等问题
- 提供生活建议、情绪陪伴、知识科普
- 根据用户创建的纪念日/倒计时内容，给出个性化建议

你的禁忌（绝对不能做）：
- 不能提供任何健康类专业判断或处理方案
- 不能预测具体疾病
- 不能代替专业人士回答健康问题
- 如果用户问健康类问题，温柔引导：「这个我不太确定，建议咨询专业人士哦 😊」

回答风格：
- 温暖、亲切、实用
- 简洁明了，不啰嗦
- 适当用 emoji 增加亲切感`

/**
 * 调用 MiniMax API（Anthropic Messages API 兼容格式）
 */
async function callMiniMax(messages) {
  const response = await require('axios').post(
    MINIMAX_BASE_URL,
    {
      model: MINIMAX_MODEL,
      messages: [
        {role: 'user', content: messages}
      ],
      max_tokens: 1024,
      temperature: 0.7
    },
    {
      headers: {
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      timeout: 15000
    }
  )
  return response.data
}

exports.main = async (event, _context) => {
  const {message, userId} = event || {}

  if (!message || typeof message !== 'string') {
    return {success: false, error: '消息内容不能为空'}
  }

  if (!MINIMAX_API_KEY) {
    return {success: false, error: 'AI 服务暂未配置，请稍后再试'}
  }

  try {
    const fullPrompt = `${SYSTEM_PROMPT}\n\n用户问题：${message}`
    const result = await callMiniMax(fullPrompt)

    let reply = ''
    if (result.content && Array.isArray(result.content)) {
      reply = result.content[0]?.text || '抱歉，我暂时无法回答这个问题'
    } else if (result.choices && result.choices[0]) {
      reply = result.choices[0].message?.content || '抱歉，我暂时无法回答这个问题'
    } else {
      reply = '抱歉，我暂时无法回答这个问题'
    }

    // 可选：记录对话历史到云数据库（用于优化后续体验）
    if (userId) {
      try {
        await db.collection('ai_chat_logs').add({
          data: {
            userId,
            message,
            reply,
            createdAt: db.serverDate()
          }
        })
      } catch(e) { /* 记录失败不影响返回 */ }
    }

    return {
      success: true,
      reply
    }

  } catch (error) {
    console.error('[ai-chat] MiniMax API error:', error?.message || error)
    return {
      success: false,
      error: 'AI 服务暂时忙碌，请稍后再试 😊'
    }
  }
}
