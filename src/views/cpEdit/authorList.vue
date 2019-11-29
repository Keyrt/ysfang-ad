<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.authorName"
        placeholder="查找作者名"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />

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
      style="width: 551px"
    >
      <el-table-column label="ID" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="作者" width="280px">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="120">
        <template slot-scope="{row}">
          <el-button
            type="primary"
            size="small"
            @click="JumpList(row.id)"
          >书籍页</el-button>
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
import { fetchAuthorList } from "@/api/edit";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination

export default {
  name: "ComplexTable",
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        //页数
        page: 1,
        // 行数
        limit: 20,
        authorName: ""
      },
      downloadLoading: false
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.listLoading = true;
      fetchAuthorList(this.listQuery).then(response => {
        this.list = response.data;
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
    // 跳转至书籍列表页
    JumpList(authorid) {
        this.$router.push({name: 'bookList',params:{author:authorid}});
    },

    // 导出功能
    handleDownload() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then(excel => {
        const tHeader = ["时间", "书籍名称", "总信息费", "结算收入"];
        const filterVal = ["time", "book_name", "income", "stratify"];
        // const data = this.list;
        const data = this.formatJson(filterVal, this.list);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "每天CP结算汇总报表"
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
</style>