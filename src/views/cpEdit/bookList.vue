<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.bookName"
        placeholder="查找书籍"
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
      style="width: 100%"
    >
      <el-table-column label="ID" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="书籍名" width="280px">
        <template slot-scope="{row}">
          <span>{{ row.book_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="作者" width="280px">
        <template slot-scope="{row}">
          <span>{{ row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="300">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">编辑</el-button>
          <el-button size="small" @click="JumpList(row.book_id)">日表</el-button>
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

    <el-dialog title="新增数据" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :model="temp"
        :rules="rules"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="日期" prop="timestamp">
          <el-date-picker
            v-model="value1"
            type="date"
            placeholder="选择日期"
            :picker-options="pickerOptions"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="总信息费" prop="income">
          <el-input v-model="temp.income" placeholder="0" />
        </el-form-item>
        <el-form-item label="结算收入">
          <span>{{temp.income / 2}}</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="createData()">添加</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchBookList, createArticle } from "@/api/edit";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination

export default {
  name: "ComplexTable",
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        //页数
        page: 1,
        // 行数
        limit: 20,
        bookName: "",
        authorid: this.$route.params.author
      },
      downloadLoading: false,

      temp: {
        id: undefined,
        bookid: undefined,
        timestamp: "",
        income: 0
      },
      dialogFormVisible: false,
      textMap: {
        update: "Edit",
        create: "Create"
      },
      value1: "",
      rules: {
        timestamp: [
          {
            type: "date",
            required: true,
            message: "timestamp is required",
            trigger: "change"
          }
        ],
        income: [
          { required: true, message: "title is required", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getTime();
  },
  methods: {
    getTime() {
      let date = new Date();
      let y = date.getFullYear();
      let m = date.getMonth() + 1;
      let d = date.getDate();
      let time = y + "-" + m + "-" + d;
      this.value1 = time;
    },
    getList() {
      this.listLoading = true;
      fetchBookList(this.listQuery).then(response => {
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
    JumpList(bookid) {
      this.$router.push({ name: "bookEdit", params: { id: bookid } });
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        bookid: undefined,
        timestamp: new Date(),
        income: 0
      };
    },
    //打开弹窗
    handleUpdate(row) {
      this.resetTemp();
      this.temp.id = row.id;
      this.temp.bookid = row.book_id;
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    //编辑新增数据
    createData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.temp.timestamp = this.value1;
          createArticle(this.temp).then(response => {
            this.dialogFormVisible = false;
            if (response.type === "success") {
              this.$notify({
                title: "成功",
                message: "添加成功",
                type: "success",
                duration: 5000
              });
            }else{
              this.$notify({
                title: "失败",
                message: "当天书本已经添加过",
                type: "error",
                duration: 5000
              });
            }
          });
        }
      });
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