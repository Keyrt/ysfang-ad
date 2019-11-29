<template>
  <div class="app-container">
    <div class="filter-container">
      <el-date-picker
        v-model="listQuery.timestamp"
        type="daterange"
        align="right"
        unlink-panels
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions"
        value-format="yyyy-MM-dd"
      ></el-date-picker>

      <el-button
        class="filter-item"
        type="primaarticlery"
        icon="el-icon-search"
        @click="handleFilter"
      >搜索</el-button>
      <el-button
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >导出</el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column width="180px" align="center" label="ID">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="时间">
        <template slot-scope="scope">
          <span>{{ scope.row.time }}</span>
        </template>
      </el-table-column>

      <el-table-column width="360px" align="center" label="书籍名称">
        <template slot-scope="scope">
          <span>{{ scope.row.book_name }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="300px" label="总信息费">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-input v-model="row.income" class="edit-input" size="small" />
            <el-button
              class="cancel-btn"
              size="small"
              icon="el-icon-refresh"
              type="warning"
              @click="cancelEdit(row)"
            >取消</el-button>
          </template>
          <span v-else>{{ row.income }}</span>
        </template>
      </el-table-column>
      <el-table-column width="120px" align="center" label="结算收入">
        <template slot-scope="scope">
          <span>{{ scope.row.income /2 }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="230">
        <template slot-scope="{row}">
          <el-button
            v-if="row.edit"
            type="success"
            size="small"
            icon="el-icon-circle-check-outline"
            @click="confirmEdit(row)"
          >确认</el-button>
          <el-button
            v-else
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="row.edit=!row.edit"
          >修改</el-button>
          <el-button size="small" type="danger" icon="el-icon-delete" @click="deleteData(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { fetchIncomeList, changeIncome, deleteIncome } from "@/api/edit";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination";

export default {
  name: "InlineEditTable",
  components: { Pagination },
  directives: { waves },

  data() {
    return {
      // 日期选择开始
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
      // 月份选择结束
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        timestamp: [],
        bookid: this.$route.params.id
      },
      downloadLoading: false
    };
  },
  created() {
    this.getList();
  },
  methods: {
    async getList() {
      this.listLoading = true;
      fetchIncomeList(this.listQuery).then(response => {
        const items = response.data;
        this.list = items.map(v => {
          this.$set(v, "edit", false); // https://vuejs.org/v2/guide/reactivity.html
          v.originalIncome = v.income; //  will be used when user click the cancel botton
          return v;
        });
        this.total = response.total;
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false;
        }, 1.5 * 1000);
      });
    },

    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    cancelEdit(row) {
      row.income = row.originalIncome;
      row.edit = false;
      this.$message({
        message: "修改已取消",
        type: "warning"
      });
    },
    confirmEdit(row) {
      row.edit = false;
      row.originalIncome = row.income;
      console.log(row);

      const editinfo = {
        SId: row.id,
        income: row.income
      };
      changeIncome(editinfo).then(response => {
        if (response.type === "success") {
          this.$message({
            message: "总信息费已修改",
            type: "success"
          });
        } else {
          this.$message({
            message: "修改失败，请联系管理员",
            type: "error"
          });
        }
      });
    },
    deleteData(row) {
      const deleteId = {
        SId: row.id
      };
      deleteIncome(deleteId).then(response => {
        if (response.type === "success") {
          const index = this.list.indexOf(row);
          this.list.splice(index, 1);
          this.$message({
            message: "删除成功",
            type: "success"
          });
        } else {
          this.$message({
            message: "删除失败，请联系管理员",
            type: "error"
          });
        }
      });
    },
    // 导出功能
    handleDownload() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then(excel => {
        const tHeader = ["ID", "时间", "书籍名称", "总信息费", "结算收入"];
        const filterVal = ["id", "time", "book_name", "income", "stratify"];
        // const data = this.list;
        const data = this.formatJson(filterVal, this.list);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: this.list[0].book_name + "书籍日表"
        });
        this.downloadLoading = false;
      });
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v =>
        filterVal.map(j => {
          // if (j === "time") {
          //   return parseTime(v[j]);
          // } else {
          return v[j];
          // }
        })
      );
    }
  }
};
</script>

<style>
.filter-container {
  padding-bottom: 30px;
}
.el-date-editor > .el-range-separator {
  width: 8% !important;
  padding: 0 5px;
  line-height: 32px;
  color: #303133;
}
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
