<template>
  <div class="app-container">
    <div class="filter-container">
      <el-date-picker
        v-model="listQuery.time"
        type="monthrange"
        align="right"
        unlink-panels
        range-separator="至"
        start-placeholder="开始月份"
        end-placeholder="结束月份"
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
      style="width: 1202px;"
    >
      <el-table-column label="时间" width="400px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总信息费" width="400px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.income }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结算收入（元）" width="400px" align="center">
        <template slot-scope="scope">
          <span style="color:red;">{{ scope.row.stratify }}</span>
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
import { fetchListMonty } from "@/api/table";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination

export default {
  name: "Monthly",
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      // 月份选择开始
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
        shortcuts: [
          {
            text: "本月",
            onClick(picker) {
              picker.$emit("pick", [new Date(), new Date()]);
            }
          },
          {
            text: "今年至今",
            onClick(picker) {
              const end = new Date();
              const start = new Date(new Date().getFullYear(), 0);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近六个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setMonth(start.getMonth() - 6);
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
        //页数
        page: 1,
        // 行数
        limit: 20,
        // 结束月份
        time: []
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
      fetchListMonty(this.listQuery).then(response => {
        console.log(response.data);
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

    // 导出功能
    handleDownload() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then(excel => {
        const tHeader = ["月份", "总信息费", "结算收入（元）"];
        const filterVal = ["time", "income", "stratify"];
        // const data = this.list;
        const data = this.formatJson(filterVal, this.list);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "cp包月结算"
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