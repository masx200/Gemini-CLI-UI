import { parseMCPServerStatus } from "./parseMCPServerStatus.ts";
import { test } from "vitest";
test("parseMCPServerStatus", () => {
  if (typeof window === "undefined") {
    testParseMCPServerStatus();
  }
});
// 测试数据
const testContent = `Configured MCP servers: 
 
 🔴 [1mnode[0m - Disconnected (0 tools cached) 
 [0m  No tools or prompts available 
 
 🟢 [1m百度地图[0m - Ready (10 tools) 
 [0m  [36mTools:[0m 
   - [36mmap_directions[0m: 
       [32m路线规划服务: 根据起终点\`位置名称\`或\`纬经度坐标\`规划出行路线.[0m 
       [32m驾车路线规划: 根据起终点\`位置名称\`或\`纬经度坐标\`规划驾车出行路线.[0m 
       [32m骑行路线规划: 根据起终点\`位置名称\`或\`纬经度坐标\`规划骑行出行路线.[0m 
       [32m步行路线规划: 根据起终点\`位置名称\`或\`纬经度坐标\`规划步行出行路线.[0m 
       [32m公交路线规划: 根据起终点\`位置名称\`或\`纬经度坐标\`规划公共交通出行路线.[0m 
   - [36mmap_directions_matrix[0m: 
       [32m批量算路服务: 根据起点和终点坐标计算路线规划距离和行驶时间.[0m 
       [32m批量算路目前支持驾车、骑行、步行.[0m 
       [32m步行时任意起终点之间的距离不得超过200KM, 超过此限制会返回参数错误.[0m 
       [32m驾车批量算路一次最多计算100条路线, 起终点个数之积不能超过100.[0m 
   - [36mmap_geocode[0m: 
       [32m地理编码服务: 将地址解析为对应的位置坐标.地址结构越完整, 地址内容越准确, 解析的坐标精度越高.[0m 
   - [36mmap_ip_location[0m: 
       [32mIP定位服务: 通过所给IP获取具体位置信息和城市名称, 可用于定位IP或用户当前位置.[0m 
   - [36mmap_mark[0m: 
       [32m根据旅游规划生成地图规划展示, 当根据用户的需求申城完旅游规划后, 在给用户详细讲解旅游规划的同时, 也需要使用该工具生成旅游规划地图. 该工具只会生成一个分享用的url, 并对针对该url生成一个二维码便于用户分享.[0m 
   - [36mmap_place_details[0m: 
       [32m地点详情检索服务: 地点详情检索针对指定POI, 检索其相关的详情信息.[0m 
       [32m通过地点检索服务获取POI uid.使用地点详情检索功能, 传入uid, 即可检索POI详情信息, 如评分、营业时间等(不同类型POI对应不同类别详情数据).[0m 
   - [36mmap_reverse_geocode[0m: 
       [32m逆地理编码服务: 根据纬经度坐标, 获取对应位置的地址描述, 所在行政区划, 道路以及相关POI等信息[0m 
   - [36mmap_road_traffic[0m: 
       [32m实时路况查询服务: 查询实时交通拥堵情况, 可通过指定道路名和区域形状(矩形, 多边形, 圆形)进行实时路况查询.[0m 
       [32m道路实时路况查询: 查询具体道路的实时拥堵评价和拥堵路段、拥堵距离、拥堵趋势等信息.[0m 
       [32m矩形区域实时路况查询: 查询指定矩形地理范围的实时拥堵情况和各拥堵路段信息.[0m 
       [32m多边形区域实时路况查询: 查询指定多边形地理范围的实时拥堵情况和各拥堵路段信息.[0m 
       [32m圆形区域(周边)实时路况查询: 查询某中心点周边半径范围内的实时拥堵情况和各拥堵路段信息.[0m 
   - [36mmap_search_places[0m: 
       [32m地点检索服务: 支持检索城市内的地点信息(最小到city级别), 也可支持圆形区域内的周边地点信息检索.[0m 
       [32m城市内检索: 检索某一城市内（目前最细到城市级别）的地点信息.[0m 
       [32m周边检索: 设置圆心和半径, 检索圆形区域内的地点信息（常用于周边检索场景）.[0m 
   - [36mmap_weather[0m: 
       [32m天气查询服务: 通过行政区划或是经纬度坐标查询实时天气信息及未来5天天气预报.[0m 
 
 🟢 [1mtavily[0m - Ready (4 tools) 
 [0m  [36mTools:[0m 
   - [36mtavily_crawl[0m: 
       [32mCrawl multiple pages from a website starting from a base URL. Use this tool when you need to gather information from multiple related pages across a website or explore a site's structure. It follows internal links and extracts content from multiple pages, but truncates content to 500 characters per page. For full content extraction, use tavily_map to discover URLs first, then tavily_extract to get complete content from specific pages. Useful for comprehensive research on documentation sites, blogs, or when you need to understand the full scope of information available on a website.[0m 
   - [36mtavily_extract[0m: 
       [32mExtract and process content from specific web pages. Use this tool when you have URLs and need to get the full text content from those pages. Returns clean, structured content in markdown or text format. Useful for reading articles, documentation, or any web page content that you need to analyze or reference.[0m 
   - [36mtavily_map[0m: 
       [32mMap and discover the structure of a website by finding all its URLs and pages. Use this tool when you need to understand a website's organization, find specific pages, or get an overview of all available content without extracting the actual text. Returns a structured list of URLs and their relationships. Useful for site exploration, finding documentation pages, or understanding how a website is organized.[0m 
   - [36mtavily_search[0m: 
       [32mSearch the web for real-time information about any topic. Use this tool when you need up-to-date information that might not be available in your training data, or when you need to verify current facts. The search results will include relevant snippets and URLs from web pages. This is particularly useful for questions about current events, technology updates, or any topic that requires recent information.[0m 
 
 [0m`;

// 测试解析函数
function testParseMCPServerStatus() {
  console.log("开始测试MCP服务器状态解析函数...");

  try {
    const result = parseMCPServerStatus(testContent);

    console.log("解析结果:");
    console.log(JSON.stringify(result, null, 2));

    // 验证解析结果
    console.log("\n验证结果:");
    console.log(`服务器数量: ${result.length}`);

    result.forEach((server, index) => {
      console.log(`\n服务器 ${index + 1}:`);
      console.log(`  名称: ${server.name}`);
      console.log(`  状态: ${server.status}`);
      console.log(`  描述: ${server.description}`);
      console.log(`  工具数量: ${server.tools.length}`);
      //@ts-ignore
      server.tools.forEach((tool, toolIndex) => {
        console.log(`    工具 ${toolIndex + 1}:`);
        console.log(`      名称: ${tool.name}`);
        console.log(`      描述: ${tool.description.substring(0, 100)}...`);
        console.log(`      详细信息数量: ${tool.details.length}`);
      });
    });

    console.log("\n测试完成！");
    return result;
  } catch (error) {
    console.error("测试失败:", error);
    throw error;
  }
}

// 如果在Node.js环境中运行

// 导出测试函数供其他模块使用
export { testParseMCPServerStatus, testContent };
