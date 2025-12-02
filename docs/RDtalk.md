我们应该有2个表单，一个是device store  这个表单简单，就是直接显示入库的设备及时间，因为已经是给租户看的，tenant_name就不显示了。后面我们要设计一个给全局用的，比如 tenant_admin(或其它名字，global-store, system_storeManage 系统)才能可见及管理调整设备与租户的管理，或许我们未来单独建后台管理界面。
这租户的界面，可需要展示分配给他的设备清单，这样方便他们整体控制什么设备允许接入到他们的系统。


1. bindtime 是 system_storeManage 操作分配时间，是不是改为 allocate_time 比较合适， 而且不需要在这里给租户展示
2. 要增加一个 alllow_access   表示这个设备可以接入到业务系统，自然，不在这个表的，也就不能接入了。
这个allow_access 适合 system, 还是租户
对于租户，可能就是出/入库，一个入库时间， 一个出库时间，出库表表示可用于安装并允许接入系统？
怎么设计较好。


profile/PHI/contact

Gap hight 10px
Basic Information
nickname[input 150px]  account[100px]  *First Name[input 150px] []=nickname  lastName[input 150px]  
status [100px] service_level[150px]  family_tag[input 100px] resident_access: enable/disable  滑动选项，默认disable
Admission Date     Discharge Date
Note:
[         ]

PHI table
Gender：male/femaale 单选项   Gender[]
Email [input 150px] []save phone [input 150px] []save
label: use to reset passwd,Don't save, if save,please check []save

Chronic Conditions
Hypertension 。。。
分2行，每行3个，不要中文备注
Medical History
[   ]


Emergency Contact
label: family account= resident'account+A/B/C/D  family'account+A/B/C/D
for example: resident'account='R001',   login_account= 'R001A'
             family'account ='F001',  login_account= 'F001A'
A[]enable  firstName[100px] lastName[100px] relationship [下拉框]
   Email [input 150px] []save phone [input 150px] []save
   label: use to reset passwd,Don't save, if save,please check []save
   receive alarm SMS []  email[]  复选框
B[]enable  firstName[100px] lastName[100px] relationship [下拉框]
   Email [input 150px] []save phone [input 150px] []save
   label: use to reset passwd,Don't save, if save,please check []save
   receive alarm SMS []  email[]  复选框   
C[]enable  firstName[100px] lastName[100px] relationship [下拉框]
   Email [input 150px] []save phone [input 150px] []save
   label: use to reset passwd,Don't save, if save,please check []save
   receive alarm SMS []  email[]  复选框
D[]enable  firstName[100px] lastName[100px] relationship [下拉框]
   Email [input 150px] []save phone [input 150px] []save
   label: use to reset passwd,Don't save, if save,please check []save
   receive alarm SMS []  email[]  复选框






   