<template>
  <div class="upload-container p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4">
    <h2 class="text-2xl font-bold text-center  text-green-500">Upload File</h2>
    <div class="flex flex-col space-y-4">
      <input v-model="fileName" placeholder="Enter file name" class="p-2 border border-gray-300 rounded-lg text-black"/>
      <button @click="handleUpload" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
        Upload
      </button>
    </div>

    <div v-if="jobId" class="mt-6 p-4 bg-gray-100 rounded-lg">
      <h2 class="text-xl font-semibold text-blue-500">Progress</h2>
      <p class="text-gray-700">File Name: <span class="font-medium">{{ fileName }}</span></p>
      <p class="text-gray-700">Tracking Job: <span class="font-medium">{{ jobId }}</span></p>
      <p class="text-gray-700">Progress: <span class="font-medium">{{ progress }}</span></p>
    </div>
  </div>
</template>


<script lang="ts">
import { defineComponent, ref, watchEffect, watch } from "vue";
import { useMutation, useSubscription } from "@vue/apollo-composable";
import gql from "graphql-tag";

// GraphQL Mutation to upload a file
const UPLOAD_FILE_MUTATION = gql`
  mutation uploadFile($fileName: String!) {
    uploadFileInTask(fileName: $fileName) {
      message
      fileName
      jobId
    }
  }
`;

// GraphQL Subscription to track upload progress
const UPLOAD_PROGRESS_SUBSCRIPTION = gql`
  subscription checkUploadProgress($jobId: String!) {
    uploadProgress(jobId: $jobId)
  }
`;

export default defineComponent({
  name: "UploadFile",
  setup() {
    // 定義 TypeScript 類型
    const fileName = ref<string>("example.txt");
    const jobId = ref<string | null>(null);
    const progress = ref<string | null>(null);

    // 使用 GraphQL Mutation
    const { mutate: uploadFile } = useMutation<{ uploadFile: string }>(
      UPLOAD_FILE_MUTATION
    );

    // 監聽 jobId，當有 jobId 時開始訂閱進度
    watchEffect(() => {
      if (jobId.value) {
        console.log("new Job ID:", jobId.value);

        const { result, stop } = useSubscription(UPLOAD_PROGRESS_SUBSCRIPTION, {
          jobId: jobId.value
        });

        // console.log("Subscription Result:", result);
        watch(result, (newResult) => {
          // console.log("Subscription Data:", newResult);
          if (newResult?.uploadProgress !== null) {
            progress.value = newResult.uploadProgress;
            console.log("Upload Progress:", progress.value);
          }
        });

        // 在组件卸载时停止订阅
        return () => stop();
      }
    });

    // 處理上傳
    const handleUpload = async () => {
      console.log("Starting upload...");
      const response = await uploadFile({ fileName: fileName.value });
      console.log("get response ...");
      console.log(response?.data?.uploadFileInTask);
      if (response?.data?.uploadFileInTask) {
        jobId.value = response.data.uploadFileInTask.jobId; // 取得 jobId
        console.log("Job ID:", jobId.value);
      }
    };

    return {
      fileName,
      jobId,
      progress,
      handleUpload,
    };
  },
});
</script>