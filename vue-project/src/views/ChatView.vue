<template>
<!-- Cleat historial messages -->
<div class="mb-2 flex justify-end">
    <button
        @click="clearMessages"
        class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-red-600"
        title="清除歷史訊息"    
    > clear
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
                <div class="text-xs text-gray-400 mt-1">
                    {{ msg.date}} {{ formatTime(msg.time) }}
                    <!-- Copy Button -->
                    <button
                        class="bg-gray-500 hover:bg-green-600 px-1 text-white rounded-lg disabled:opacity-50"
                        @click="copyToClipboard(msg.text)"
                        title="複製訊息"
                    >
                        copy
                    </button>
                </div>
            </div>
        </div>
        <!-- User message (right) -->
        <div v-else class="flex w-full justify-end">
            <div class="max-w-[80%] bg-indigo-600 text-white p-3 rounded-lg rounded-tr-none shadow-sm">
                <div class="text-sm whitespace-pre-wrap">{{ msg.text }}</div>
                <div class="text-xs text-indigo-100 mt-1 text-right">{{ msg.date}} {{ formatTime(msg.time) }}</div>
            </div>
        </div>
    </div>
    
    <!-- Loading Message -->
    <div v-if="isLoading" class="flex w-full">
        <div class="max-w-[80%] bg-gray-100 text-gray-900 p-3 rounded-lg rounded-tl-none shadow-sm dark:bg-gray-700 dark:text-white flex items-center space-x-1">
             <div class="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
             <div class="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
             <div class="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
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
            :disabled="isLoading" 
        />
        <button
            type="submit"
            :disabled="!message.trim() || isLoading"
            class="ml-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            title="送出訊息"
        >
            Send
        </button>
        <button
            type="button"
            @click="resubmitLast"
            class="ml-2 px-1 py-2 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            :disabled="!lastUserMessage || isLoading"
            title="重新送出上一則訊息"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582M20 20v-5h-.581m-1.837-7.163A7.001 7.001 0 006.582 9H4m16 6a7.001 7.001 0 01-11.582 4.163M20 15.001V15" />
            </svg>
        </button>
    </form>
</div>
</template>


<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'

type Msg = { id: number; role: 'ai' | 'user'; text: string; date: string, time: number }

const message = ref('')
const messages = ref<Msg[]>([])
const scrollRef = ref<HTMLElement | null>(null)
const isLoading = ref(false)

const lastUserMessage = computed(() => {
    const arr = messages.value.filter(m => m.role === 'user')
    return arr.length ? arr[arr.length - 1].text : ''
})

function clearMessages() {
    messages.value = []
}

function resubmitLast() {
    if (lastUserMessage.value) {
        message.value = lastUserMessage.value
        sendMessage()
    }
}

async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        console.log("內容已複製");
    } catch(err) {
        console.error("複製失敗", err);
    }
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

function generateDate() {
    const now = new Date()
    const pad = (n: number, len = 2) => n.toString().padStart(len, '0')
    const dateStr = [
        now.getFullYear(),
        '-',
        pad(now.getMonth() + 1),
        '-',
        pad(now.getDate())
    ].join('')
    return dateStr
}

function pushMessage(role: 'ai' | 'user', text: string) {
	messages.value.push({ 
        id: Date.now() + Math.floor(Math.random() * 1000), 
        role, text, 
        date: generateDate(),
        time: Date.now() })
	scrollToBottom()
}

async function sendMessage() {
	const text = message.value.trim()
	if (!text) return
	// push user message
	pushMessage('user', text)
	message.value = ''
    isLoading.value = true
    scrollToBottom()

	// // simulate AI reply (mock)
	// setTimeout(() => {
	// 	const aiReply = `Echo: 我收到你的訊息「${text}」。`
	// 	pushMessage('ai', aiReply)
	// }, 700)

    // call backend API
    try {
        // const is_chunk = false
        // const response = await fetch('http://localhost:8000/runs/stream', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ human_message: text }),
        // })
        const is_chunk = true
        const response = await fetch('http://localhost:8000/runs/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                { 
                    human_message: text,
                    model: 'gpt-4.1-nano',
                    stream: true
                }
            ),
        })
        
        if (!response.ok) {
            throw new Error('Error from API')
        }
        
        // Stop loading before showing response
        isLoading.value = false
        
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
                            
                            // // slice 出差異部分
                            // const diff = obj.data.slice(lastLength)
                            // aiText += diff
                            // lastLength = aiText.length
                            // // console.log('diff:', diff)

                            // 直接 append chunk
                            aiText += obj.data
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
        isLoading.value = false
        pushMessage('ai', 'API 串流回覆失敗')
    }

}
</script>
