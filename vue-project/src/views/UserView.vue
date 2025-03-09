<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <h1 class="text-3xl font-bold mb-4">User List</h1>

    <!-- 如果還在加載，就顯示 Loading... -->
    <p v-if="loading" class="text-center text-lg">Loading...</p>

    <div class="pb-4 bg-white dark:bg-gray-900">
      <!-- Add User Button -->
      <button 
        @click="showAddUserModal = true"
        class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
        Add User
      </button>
      
      <Modal :visible="showAddUserModal" @update:visible="showAddUserModal = $event" @userAdded="refetchUserList"/>

      <label for="table-search" class="sr-only">Search</label>
      <div class="relative mt-1">
          <div class="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
          </div>
          <input 
            type="text"
            id="table-search"
            v-model="searchQuery"
            class="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search for items">
      </div>
    </div>

    <!-- 每頁顯示記錄數量選擇 -->
    <div class="flex justify-end bg-white dark:bg-gray-900">
      <label for="itemsPerPage" class="mr-2">Items per page:</label>
      <select id="itemsPerPage" v-model="itemsPerPage" class="border border-gray-300 rounded-lg text-black">
        <option v-for="option in itemsPerPageOptions" :key="option" :value="option">{{ option }}</option>
      </select>
    </div>

    <!-- 數據加載完成後顯示表格 -->
    <div class="max-h-96 overflow-y-auto">
      <table v-if="!loading && data && data.getUser" class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <!-- <thead class="bg-gray-200"> -->
        <thead class="sticky top-0 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" class="p-4 text-center">ID</th>
            <th scope="col" class="p-4 text-center">Username</th>
            <th scope="col" class="p-4 text-center">Posts(#)</th>
            <th scope="col" class="p-4 text-center">Signup Time</th>
            <th scope="col" class="p-4 text-center">Expired Time</th>
            <th scope="col" class="p-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          <!-- <tr v-for="user in data.getUsers" :key="user.id" class="hover:bg-gray-50"> -->
          <!-- <tr v-for="user in data.getUser" :key="user.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"> -->
          <tr v-for="(user, index) in paginatedUsers" :key="user.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            <td class="px-6 py-4">{{ user.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap min-w-[50px]">{{ user.username }}</td>
            <td class="px-6 py-4">{{ user.posts.length }}</td>
            <td class="px-6 py-4 whitespace-nowrap min-w-[150px]">{{ formatTime(user.signupTime) }}</td>
            <td class="px-6 py-4 whitespace-nowrap min-w-[150px]">{{ formatTime(user.expiredTime) }}</td>
            <td class="px-6 py-4">
              <div class="flex space-x-2">
                <button @click="updateUser(user)"
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
                        Edit
                </button>
                <button @click="deleteUser(user.id)" 
                        class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full">
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
        <Modal 
          :visible="showUpdateUserModal" 
          :selectedUser="selectedUser"
          @update:selectedUser="showUpdateUserModal = $event"
          @userUpdated="refetchUserList" />
      </table>
    </div>

    <!-- 分頁控制 -->
    <div class="flex justify-center mt-4">
      <button @click="prevPage" :disabled="currentPage === 1" class="px-4 py-2 mx-1 bg-black-300 rounded disabled:opacity-50">Previous</button>
      <span class="px-4 py-2 mx-1">Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="px-4 py-2 mx-1 bg-black-300 rounded disabled:opacity-50">Next</button>
    </div>

    <!-- 顯示錯誤 -->
    <p v-if="error" class="text-red-500 text-lg mt-4">Error: {{ error.message }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import Modal from './UserModal.vue';  // 載入 Modal 組件

// export const READ_USER = gql`
//   query ReadUser($offset: Int, $limit: Int) {
//     getUser(offset: $offset, limit: $limit) {
//       id
//       username
//       posts {
//         id
//       }
//       signupTime
//       expiredTime
//       email
//     }
//   }
// `;

export const READ_USER = gql`
  query ReadUser($cursor: Int, $limit: Int) {
    getUser(cursor: $cursor, limit: $limit) {
     id
     username
     email
     cursor
     posts {
        id
        title
        content
        authorId
        authorName
     }
     signupTime
     expiredTime
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
      username
    }
  }
`;

interface Post {
  id: string;
}

interface User {
  id: string;
  username: string;
  posts: Post[];
  signupTime: string;
  expiredTime: string;
}

interface ReadUserData {
  getUser: User[];
}

export default defineComponent({
  name: 'UserList',
  components: {
    Modal
  },
  setup() {
    const selectedUser = ref(null);
    const currentPage = ref(1);
    const itemsPerPageOptions = [3, 5, 10];
    const itemsPerPage = ref(itemsPerPageOptions[1]);
    const cursor = ref(0);
    const searchQuery = ref('');

    const { result: data, loading, error, refetch } = useQuery<ReadUserData>(READ_USER, {
      cursor: cursor.value,
      limit: itemsPerPage.value,
      fetchPolicy: 'cache-first' // 或者 'cache-and-network', 'cache-first', 'no-cache' 等
    });

    watch(itemsPerPage, () => {
      currentPage.value = 1; // 每次選擇每頁顯示的記錄數量後跳到第一頁&cursor重新計算
      refetch({ cursor: 0, limit: itemsPerPage.value });
    });

    watch(currentPage, (newPage, oldPage) => {
      console.log('newPage', newPage);
      console.log('oldPage', oldPage);
      if (newPage > oldPage) {
        const max_id = Math.max(...data.value?.getUser.map(user => Number(user.id)));
        cursor.value = max_id;
      }
      else {
        cursor.value = (newPage - 1) * itemsPerPage.value;
      }
      console.log('cursor', cursor.value);
      refetch({ cursor: cursor.value, limit: itemsPerPage.value });
    });

    const deleteUserMutation = useMutation(DELETE_USER);
    const showAddUserModal = ref(false); // 用來控制 modal 的顯示與隱藏
    const showUpdateUserModal = ref(false); // 用來控制 modal 的顯示與隱藏

    const { result: data_total } = useQuery<ReadUserData>(READ_USER)
    
    //計算過濾後的用戶，根據搜索框過濾用戶
    const filteredUsers = computed(() => {
      const query = searchQuery.value.toLowerCase();
      return data_total.value?.getUser.filter(user => user.username.toLowerCase().includes(query)) || [];
    });

    const paginatedUsers = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredUsers.value.slice(start, end);
    });
    
    // TODO:
    const totalPages = computed(() => {
      return data_total.value ? Math.ceil(data_total.value.getUser.length / itemsPerPage.value) : 1;
    });

    watch(searchQuery, () => {
      currentPage.value = 1;
      cursor.value = 0;
      // totalPages.value = Math.ceil(filteredUsers.value.length / itemsPerPage.value);
    });

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    const refetchUserList = async () => {
      console.log('refetchUserList ...');
      await refetch(); // 重新載入用戶列表
    };

    // 刪除用戶
    const deleteUser = async (userId: string) => {
      if (confirm(`Are you sure you want to delete user with ID ${userId}?`)) {
        try {
          await deleteUserMutation.mutate({ id: userId });
          await refetch(); // 重新載入用戶列表
          alert('User deleted successfully!');
        } catch (err) {
          console.error('Error deleting user:', err);
          alert('Failed to delete user.');
        }
      }
    };

    // 更新用戶
    const updateUser = (userObject) => {
      selectedUser.value = userObject;  // 更新選取的使用者
      alert(`Update User with ID ${userObject.id} (Implement modal or form)`);
      showUpdateUserModal.value = true;
    };

    const formatTime = (time: string | null): string => {
      if (!time) return 'N/A';
      const date = new Date(time);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
    };


    return {
      data,
      loading,
      error,
      formatTime,
      deleteUser,
      updateUser,
      showAddUserModal,
      showUpdateUserModal,
      refetchUserList,
      selectedUser,
      currentPage,
      totalPages,
      nextPage,
      prevPage,
      itemsPerPageOptions,
      itemsPerPage,
      searchQuery,
      filteredUsers,
      paginatedUsers
    };
  },
});
</script>

<!-- TODO: user fragment(https://hygraph.com/learn/graphql/fragments) -->