<template>
<!-- 清除按鈕 -->
<div class="mb-2 flex justify-end">
    <button
        @click="clearMessages"
        class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-red-600"
    > clear chat
    </button>
</div>
    <div class="p-4 h-[calc(100vh-4rem)] flex flex-col">
        <!-- Messages list -->
        <div ref="scrollRef" class="mb-4 overflow-y-auto space-y-4 flex-1">
        <div v-for="msg in messages" :key="msg.id" class="flex">
            <!-- AI message (left) -->
            <div v-if="msg.role === 'ai'" class="flex w-full">
                <div class="max-w-[80%] bg-gray-100 text-gray-900 p-3 rounded-lg rounded-tl-none shadow-sm dark:bg-gray-700 dark:text-white">
                    <div class="text-sm whitespace-pre-wrap">{{ msg.text }}</div>
                    <div class="text-xs text-gray-400 mt-1">{{ formatTime(msg.time) }}</div>
                </div>
            </div>
            <!-- User message (right) -->
            <div v-else class="flex w-full justify-end">
                <div class="max-w-[80%] bg-indigo-600 text-white p-3 rounded-lg rounded-tr-none shadow-sm">
                    <div class="text-sm whitespace-pre-wrap">{{ msg.text }}</div>
                    <div class="text-xs text-indigo-100 mt-1 text-right">{{ formatTime(msg.time) }}</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Input form (stays at bottom) -->
    <form @submit.prevent="sendMessage" class="flex items-center mt-auto">
        <input
            v-model="message"
            type="text"
            placeholder="Type a message..."
            aria-label="Message"
            class="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <button
            type="submit"
            :disabled="!message.trim()"
            class="ml-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
            Send
        </button>
    </form>
</div>
</template>


<script setup lang="ts">
import { ref, nextTick } from 'vue'

type Msg = { id: number; role: 'ai' | 'user'; text: string; time: number }

const message = ref('')
const messages = ref<Msg[]>([])
const scrollRef = ref<HTMLElement | null>(null)

function clearMessages() {
    messages.value = []
}

function formatTime(ts: number) {
	const d = new Date(ts)
	return d.toLocaleTimeString()
}

function scrollToBottom() {
	nextTick(() => {
		const el = scrollRef.value
		if (el) {
			el.scrollTop = el.scrollHeight
		}
	})
}

function pushMessage(role: 'ai' | 'user', text: string) {
	messages.value.push({ id: Date.now() + Math.floor(Math.random() * 1000), role, text, time: Date.now() })
	scrollToBottom()
}

async function sendMessage() {
	const text = message.value.trim()
	if (!text) return
	// push user message
	pushMessage('user', text)
	message.value = ''

	// // simulate AI reply (mock)
	// setTimeout(() => {
	// 	const aiReply = `Echo: 我收到你的訊息「${text}」。`
	// 	pushMessage('ai', aiReply)
	// }, 700)

    // call backend API
    try {
        const response = await fetch('http://localhost:8000/runs/stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ human_message: text }),
        })
        if (!response.ok) {
            throw new Error('Error from API')
        }
        // console.log('response status:', response.ok)

        let aiText = ''
        let lastLength = 0
        const aiMsg = (() => {
            const id = Date.now() + Math.floor(Math.random() * 1000)
            pushMessage('ai', '')
            return messages.value.find(msg => msg.id === id) || messages.value[messages.value.length - 1]
        })()
        scrollToBottom()

        const reader = response.body?.getReader()
        const decoder = new TextDecoder('utf-8')
        if (reader && aiMsg) {
            let buffer = ''
            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                buffer += decoder.decode(value, { stream: true })
                let lines = buffer.split('\n')
                buffer = lines.pop() || ''
                for (const line of lines) {
                    if (!line.trim()) continue
                    try {
                        const obj = JSON.parse(line)
                        if (obj.data) {
                            // console.log('aiText before:', aiText)
                            // console.log('obj.data:', obj.data)
                            // console.log('lastLength:', lastLength)
                            const diff = obj.data.slice(lastLength)
                            aiText += diff
                            lastLength = aiText.length
                            // console.log('diff:', diff)
                            aiMsg.text = aiText
                            scrollToBottom()
                        }
                    } catch (e) {
                        // 忽略解析錯誤
                    }
                }
            }
        }
    } catch (err) {
        pushMessage('ai', 'API 串流回覆失敗')
    }

}
</script>
