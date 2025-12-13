<template>
  <div class="test-data-viewer">
    <h1>Test Data Viewer</h1>
    <p class="mock-status">
      <span :class="mockEnabled ? 'enabled' : 'disabled'">
        Mock Status: {{ mockEnabled ? 'Enabled' : 'Disabled' }}
      </span>
    </p>

    <div class="section">
      <h2>Test Accounts</h2>
      <div class="test-accounts">
        <div class="account-group">
          <h3>Staff Accounts</h3>
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th>Password</th>
                <th>Scenario</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ login?.testAccounts?.staff?.singleInstitution || '-' }}</td>
                <td>{{ login?.testPasswords?.correct || '-' }}</td>
                <td>Single institution, login success</td>
              </tr>
              <tr>
                <td>{{ login?.testAccounts?.staff?.multipleInstitutions || '-' }}</td>
                <td>{{ login?.testPasswords?.correct || '-' }}</td>
                <td>Multiple institutions, selection required</td>
              </tr>
              <tr>
                <td>{{ login?.testAccounts?.staff?.notFound || '-' }}</td>
                <td>Any</td>
                <td>Account not found</td>
              </tr>
              <tr>
                <td>{{ login?.testAccounts?.staff?.disabled || '-' }}</td>
                <td>Any</td>
                <td>Account disabled</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="account-group">
          <h3>Resident Accounts</h3>
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th>Password</th>
                <th>Scenario</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ login?.testAccounts?.resident?.singleInstitution || '-' }}</td>
                <td>{{ login?.testPasswords?.correct || '-' }}</td>
                <td>Single institution, login success</td>
              </tr>
              <tr>
                <td>{{ login?.testAccounts?.resident?.multipleInstitutions || '-' }}</td>
                <td>{{ login?.testPasswords?.correct || '-' }}</td>
                <td>Multiple institutions, selection required</td>
              </tr>
              <tr>
                <td>{{ login?.testAccounts?.resident?.notFound || '-' }}</td>
                <td>Any</td>
                <td>Account not found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Test Data Examples</h2>
      <div class="data-examples">
        <div class="example-item">
          <h3>Single Institution (Staff)</h3>
          <pre>{{ login ? JSON.stringify(login.singleInstitutionStaff, null, 2) : 'Loading...' }}</pre>
        </div>
        <div class="example-item">
          <h3>Multiple Institutions (Staff)</h3>
          <pre>{{ login ? JSON.stringify(login.multipleInstitutionsStaff, null, 2) : 'Loading...' }}</pre>
        </div>
        <div class="example-item">
          <h3>Login Success (Staff)</h3>
          <pre>{{ login ? JSON.stringify(login.loginSuccessStaff, null, 2) : 'Loading...' }}</pre>
        </div>
        <div class="example-item">
          <h3>Login Success (Resident)</h3>
          <pre>{{ login ? JSON.stringify(login.loginSuccessResident, null, 2) : 'Loading...' }}</pre>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>API Response Format</h2>
      <div class="api-format">
        <div class="format-item">
          <h3>Success Response</h3>
          <pre>{{ login ? JSON.stringify(login.loginResponses.success(login.loginSuccessStaff), null, 2) : 'Loading...' }}</pre>
        </div>
        <div class="format-item">
          <h3>Error Response (Wrong Password)</h3>
          <pre>{{ login ? JSON.stringify(login.loginResponses.wrongPassword(), null, 2) : 'Loading...' }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const mockEnabled = ref(import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true')
const login = ref<any>(null)

onMounted(async () => {
  // 使用动态导入，避免路径解析问题
  const loginModule = await import('@test/index')
  login.value = loginModule.login
})
</script>

<style scoped>
.test-data-viewer {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 16px;
}

.mock-status {
  margin-bottom: 24px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

.mock-status .enabled {
  color: #52c41a;
  font-weight: bold;
}

.mock-status .disabled {
  color: #ff4d4f;
  font-weight: bold;
}

.section {
  margin-bottom: 32px;
}

.section h2 {
  margin-bottom: 16px;
  border-bottom: 2px solid #1890ff;
  padding-bottom: 8px;
}

.test-accounts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.account-group h3 {
  margin-bottom: 12px;
  color: #1890ff;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

thead {
  background: #fafafa;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e8e8e8;
}

th {
  font-weight: 600;
}

.data-examples,
.api-format {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.example-item,
.format-item {
  background: white;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.example-item h3,
.format-item h3 {
  margin-bottom: 12px;
  color: #1890ff;
}

pre {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .test-accounts,
  .data-examples,
  .api-format {
    grid-template-columns: 1fr;
  }
}
</style>

