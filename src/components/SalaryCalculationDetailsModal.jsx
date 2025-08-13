import {
  CalculatorOutlined,
  ClockCircleOutlined,
  IdcardOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Modal,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
  message
} from 'antd';
import React, { useEffect, useState } from 'react';

const { Title, Text, Paragraph } = Typography;

const SalaryCalculationDetailsModal = ({ visible, onCancel, payrollId, employeeRecord }) => {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [formulaOpen, setFormulaOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [deductionsOpen, setDeductionsOpen] = useState(false);
  const [taxOpen, setTaxOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchSalaryDetails();
    }
  }, [visible, payrollId, employeeRecord]);

  const fetchSalaryDetails = async () => {
    setLoading(true);
    try {
      console.log('🔄 Modal: Starting to fetch TopCV salary details...');
      console.log('🔄 Modal: employeeRecord received:', employeeRecord);
      
      // Tạo dữ liệu hiển thị từ record thực tế; Việt hóa hoàn toàn
      if (employeeRecord && (employeeRecord.topCVResult || employeeRecord.calculationMethod === 'HOURLY')) {
        const isTeacher = employeeRecord.contractType === 'TEACHER' || employeeRecord.calculationMethod === 'HOURLY';
        const totalWorkingDays = employeeRecord.totalWorkingDays || (employeeRecord.standardMonthlyHours ? employeeRecord.standardMonthlyHours / 8 : 22);
        const actualWorkingDays = employeeRecord.actualWorkingDays || Math.round((employeeRecord.totalWorkingHours || 0) / 8);
        const weekendHours = employeeRecord.weekendWorkingHours || 0;
        const weekdayHours = employeeRecord.weekdayWorkingHours || Math.max((employeeRecord.totalWorkingHours || 0) - weekendHours, 0);
        const regularHours = weekdayHours;
        const hourlyRate = isTeacher ? (employeeRecord.hourlyRate || 0) : Math.round((employeeRecord.baseSalary || 0) / 176);

        const topCV = employeeRecord.topCVResult || {};
        const insurance = topCV.insuranceDetails || {};
        const socialInsurance = Math.round(insurance.socialInsuranceEmployee || 0);
        const healthInsurance = Math.round(insurance.healthInsuranceEmployee || 0);
        const unemploymentInsurance = Math.round(insurance.unemploymentInsuranceEmployee || 0);
        const personalIncomeTax = Math.round(topCV.personalIncomeTax || 0);
        const totalEmployeeContrib = Math.round(insurance.totalEmployeeContribution || 0);
        const weekendPay = employeeRecord.weekendPay || 0;
        const weekdayPay = isTeacher ? Math.round(hourlyRate * regularHours) : (employeeRecord.grossPay || 0);
        const grossSalary = isTeacher ? (weekdayPay + Math.round(weekendPay)) : (employeeRecord.grossPay || 0);
        const netSalary = isTeacher ? grossSalary : (employeeRecord.totalSalary || 0);

        const progressiveBrackets = topCV.taxBrackets || [];
        // Thuế: tóm tắt (fallback nếu BE không gửi đủ)
        const personalDeduction = 11_000_000;
        const dependentsFromTopCV = Math.round(topCV.dependentDeductions || 0);
        const dependentsFromCount = (topCV.numberOfDependents || 0) * 4_400_000;
        const dependentDeductions = dependentsFromTopCV || dependentsFromCount || 0;
        // reuse totalEmployeeContrib declared above
        const fallbackIncomeBeforeTax = (grossSalary || 0) - (totalEmployeeContrib || 0);
        const incomeBeforeTax = Math.round((topCV.incomeBeforeTax ?? fallbackIncomeBeforeTax) || 0);
        const taxableIncome = Math.max(incomeBeforeTax - personalDeduction - dependentDeductions, 0);
        const mockDetails = {
          employeeId: employeeRecord.userId,
          employeeName: employeeRecord.fullName,
          period: employeeRecord.payPeriodStart ? employeeRecord.payPeriodStart.substring(0, 7) : new Date().toISOString().substring(0, 7),
          payPeriodStart: employeeRecord.payPeriodStart,
          payPeriodEnd: employeeRecord.payPeriodEnd,
          contractDetails: {
            contractType: employeeRecord.contractType,
            position: employeeRecord.contractType === 'TEACHER' ? 'Giảng viên' : 'Nhân viên',
            department: employeeRecord.department,
            workingHours: isTeacher ? 'Theo giờ (từ chấm công)' : '8 giờ/ngày',
            contractStatus: 'ACTIVE',
            contractStartDate: new Date().toISOString().split('T')[0],
            contractEndDate: null,
            contractSalary: employeeRecord.baseSalary,
            baseSalary: employeeRecord.baseSalary,
            salaryType: isTeacher ? 'THEO_GIO' : 'GROSS',
            hourlyRate
          },
          workingHoursSummary: {
            totalWorkingDays,
            actualWorkingDays,
            regularHours: weekdayHours,
            overtimeHours: 0,
            weekendHours
          },
          salaryCalculationSteps: {
            step1_BaseSalary: employeeRecord.baseSalary,
            step2_RegularPay: weekdayPay,
            step3_OvertimePay: 0,
            step4_HolidayPay: 0,
            step5_WeekendPay: isTeacher ? Math.round(weekendPay) : 0,
            grossSalary,
            deductions: {
              socialInsurance: isTeacher ? 0 : socialInsurance,
              healthInsurance: isTeacher ? 0 : healthInsurance,
              unemploymentInsurance: isTeacher ? 0 : unemploymentInsurance,
              personalIncomeTax: isTeacher ? 0 : personalIncomeTax,
              latePenalty: 0,
              absentPenalty: 0,
              totalDeductions: isTeacher ? 0 : (totalEmployeeContrib + personalIncomeTax)
            },
            netSalary
          },
          calculationFormulas: [
            `Lương cơ bản (hợp đồng): ${formatCurrency(employeeRecord.baseSalary)}`,
            isTeacher ? `Lương ngày thường = Đơn giá giờ × Giờ ngày thường = ${formatCurrency(hourlyRate)} × ${weekdayHours}h = ${formatCurrency(weekdayPay)}` : `Lương thực tế = Lương cơ bản × (Ngày làm thực tế / Ngày làm chuẩn)`,
            isTeacher ? `Lương cuối tuần (2x) = Đơn giá giờ × 2 × Giờ cuối tuần = ${formatCurrency(hourlyRate)} × 2 × ${weekendHours}h = ${formatCurrency(weekendPay)}` : `Lương thô = ${formatCurrency(employeeRecord.grossPay)}`,
            isTeacher ? `Tổng GROSS = Ngày thường + Cuối tuần = ${formatCurrency(grossSalary)}` : `BHXH (8%) = ${formatCurrency(socialInsurance)}`,
            isTeacher ? `BHXH/BHYT/BHTN = 0 (HĐ theo giờ)` : `BHYT (1.5%) = ${formatCurrency(healthInsurance)}`,
            isTeacher ? `Thuế TNCN = 0 (HĐ theo giờ)` : `BHTN (1%) = ${formatCurrency(unemploymentInsurance)}`,
            isTeacher ? `Lương thực nhận = ${formatCurrency(netSalary)}` : `Thuế TNCN (lũy tiến) = ${formatCurrency(personalIncomeTax)}`,
            isTeacher ? '' : `Lương thực nhận = ${formatCurrency(netSalary)}`
          ],
          weekendFormula: isTeacher
            ? `Cách tính lương cuối tuần: Đơn giá giờ × 2 × Giờ cuối tuần = ${formatCurrency(hourlyRate)} × 2 × ${weekendHours}h = ${formatCurrency(weekendPay)}`
            : `Hợp đồng theo tháng: nếu là giáo viên theo giờ mới áp dụng hệ số 2x cuối tuần`,
          taxProgressive: progressiveBrackets.map((b, idx) => ({
            idx: idx + 1,
            from: b.fromAmount,
            to: b.toAmount,
            rate: b.taxRate,
            taxable: b.taxableAmount,
            tax: b.taxAmount,
          })),
          taxDetails: {
            incomeBeforeTax,
            personalDeduction,
            dependentDeductions,
            taxableIncome,
            personalIncomeTax,
          }
        };
        setDetails(mockDetails);
      } else {
        throw new Error('Không có thông tin TopCV calculation details');
      }
    } catch (error) {
      console.error('❌ Modal: Error creating TopCV salary details:', error);
      message.error('Không thể tải chi tiết tính lương TopCV!');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
  };

  const formatHours = (hours) => {
    if (!hours) return '0.0h';
    return parseFloat(hours).toFixed(1) + 'h';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <Modal
      title={
        <Space>
          <CalculatorOutlined />
          <span>Chi tiết tính lương TopCV - {details?.employeeName || employeeRecord?.fullName}</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      style={{ top: 20 }}
      styles={{
        body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }
      }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang tải chi tiết TopCV calculation...</div>
        </div>
      ) : details ? (
        <div>
          {/* Employee & Period Information */}
          <Card title={<><UserOutlined /> Thông tin nhân viên & kỳ lương</>} style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Mã nhân viên">{details.employeeId}</Descriptions.Item>
                  <Descriptions.Item label="Họ và tên">{details.employeeName}</Descriptions.Item>
                  <Descriptions.Item label="Kỳ lương">{details.period}</Descriptions.Item>
                  <Descriptions.Item label="Từ ngày">{formatDate(details.payPeriodStart)}</Descriptions.Item>
                  <Descriptions.Item label="Đến ngày">{formatDate(details.payPeriodEnd)}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Alert
                  message="Thông tin được tính toán bằng hệ thống TopCV với dữ liệu hợp đồng và chấm công thực tế"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              </Col>
            </Row>
          </Card>

          {/* Contract Information - Real Data */}
          <Card title={<><IdcardOutlined /> Thông tin hợp đồng lao động (TopCV System)</>} style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label="Loại hợp đồng">
                    <Tag color={details.contractDetails?.contractType === 'TEACHER' ? 'blue' : 'green'}>
                      {details.contractDetails?.contractType === 'TEACHER' ? 'Giảng viên' : 'Nhân viên'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Chức vụ">{details.contractDetails?.position || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Phòng ban">{details.contractDetails?.department || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Giờ làm việc">{details.contractDetails?.workingHours || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Trạng thái hợp đồng">
                    <Tag color={details.contractDetails?.contractStatus === 'ACTIVE' ? 'green' : 'orange'}>
                      {details.contractDetails?.contractStatus || 'N/A'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label="Ngày bắt đầu hợp đồng">
                    {formatDate(details.contractDetails?.contractStartDate || employeeRecord?.contractStartDate)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày kết thúc hợp đồng">
                    {formatDate(details.contractDetails?.contractEndDate || employeeRecord?.contractEndDate)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Lương theo hợp đồng">
                    <Text strong style={{ color: '#1890ff' }}>
                      {formatCurrency(details.contractDetails?.contractSalary || details.contractDetails?.baseSalary)}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại lương">{details.contractDetails?.salaryType}</Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </Card>

          {/* Salary Structure from Contract */}
 

          {/* Working Hours from Attendance System */}
          <Card title={<><ClockCircleOutlined /> Giờ làm việc thực tế (Từ hệ thống chấm công)</>} style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Tổng ngày làm việc"
                  value={details.workingHoursSummary?.totalWorkingDays}
                  formatter={(value) => parseFloat(value || 0).toFixed(1)}
                  suffix="ngày"
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Ngày công thực tế"
                  value={details.workingHoursSummary?.actualWorkingDays}
                  formatter={(value) => parseFloat(value || 0).toFixed(1)}
                  suffix="ngày"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Giờ làm thường"
                  value={details.workingHoursSummary?.regularHours}
                  formatter={(value) => formatHours(value)}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Giờ tăng ca"
                  value={details.workingHoursSummary?.overtimeHours}
                  formatter={(value) => formatHours(value)}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>
          </Card>

          {/* Calculation Results */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Card
                size="small"
                title={<Row justify="space-between" align="middle"><Text strong>💰 Tổng thu nhập</Text><Button type="link" size="small" onClick={() => setIncomeOpen(true)}>Xem chi tiết</Button></Row>}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Row justify="space-between">
                    <Text>Lương cơ bản (hợp đồng):</Text>
                    <Text strong>{formatCurrency(details.salaryCalculationSteps?.step1_BaseSalary)}</Text>
                  </Row>
                  <Row justify="space-between">
                    <Text>Lương giờ làm thực tế:</Text>
                    <Text strong>{formatCurrency(details.salaryCalculationSteps?.step2_RegularPay)}</Text>
                  </Row>
                  {details.salaryCalculationSteps?.step3_OvertimePay > 0 && (
                    <Row justify="space-between">
                      <Text>Lương tăng ca:</Text>
                      <Text strong style={{ color: '#1890ff' }}>{formatCurrency(details.salaryCalculationSteps?.step3_OvertimePay)}</Text>
                    </Row>
                  )}
                  {details.salaryCalculationSteps?.step4_HolidayPay > 0 && (
                    <Row justify="space-between">
                      <Text>Lương ngày lễ:</Text>
                      <Text strong style={{ color: '#faad14' }}>{formatCurrency(details.salaryCalculationSteps?.step4_HolidayPay)}</Text>
                    </Row>
                  )}
                  {details.salaryCalculationSteps?.step5_WeekendPay > 0 && (
                    <Row justify="space-between">
                      <Text>Lương cuối tuần:</Text>
                      <Text strong style={{ color: '#722ed1' }}>{formatCurrency(details.salaryCalculationSteps?.step5_WeekendPay)}</Text>
                    </Row>
                  )}
                  <Divider />
                  <Row justify="space-between">
                    <Text strong>Tổng lương gộp:</Text>
                    <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                      {formatCurrency(details.salaryCalculationSteps?.grossSalary)}
                    </Text>
                  </Row>
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                size="small"
                title={<Row justify="space-between" align="middle"><Text strong>📉 Các khoản khấu trừ theo luật</Text><Button type="link" size="small" onClick={() => setDeductionsOpen(true)}>Xem chi tiết</Button></Row>}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {details.salaryCalculationSteps?.deductions?.socialInsurance > 0 && (
                    <Row justify="space-between">
                      <Text>BHXH (8% lương cơ bản):</Text>
                      <Text style={{ color: '#f5222d' }}>-{formatCurrency(details.salaryCalculationSteps.deductions.socialInsurance)}</Text>
                    </Row>
                  )}
                  {details.salaryCalculationSteps?.deductions?.healthInsurance > 0 && (
                    <Row justify="space-between">
                      <Text>BHYT (1.5% lương cơ bản):</Text>
                      <Text style={{ color: '#f5222d' }}>-{formatCurrency(details.salaryCalculationSteps.deductions.healthInsurance)}</Text>
                    </Row>
                  )}
                  {details.salaryCalculationSteps?.deductions?.unemploymentInsurance > 0 && (
                    <Row justify="space-between">
                      <Text>BHTN (1% lương cơ bản):</Text>
                      <Text style={{ color: '#f5222d' }}>-{formatCurrency(details.salaryCalculationSteps.deductions.unemploymentInsurance)}</Text>
                    </Row>
                  )}
                  {details.salaryCalculationSteps?.deductions?.personalIncomeTax > 0 && (
                    <Row justify="space-between">
                      <Text>Thuế TNCN (lũy tiến):</Text>
                      <Text style={{ color: '#f5222d' }}>-{formatCurrency(details.salaryCalculationSteps.deductions.personalIncomeTax)}</Text>
                    </Row>
                  )}
                  {details.salaryCalculationSteps?.deductions?.latePenalty > 0 && (
                    <Row justify="space-between">
                      <Text>Phạt đi muộn:</Text>
                      <Text style={{ color: '#f5222d' }}>-{formatCurrency(details.salaryCalculationSteps.deductions.latePenalty)}</Text>
                    </Row>
                  )}
                  {details.salaryCalculationSteps?.deductions?.absentPenalty > 0 && (
                    <Row justify="space-between">
                      <Text>Phạt vắng mặt:</Text>
                      <Text style={{ color: '#f5222d' }}>-{formatCurrency(details.salaryCalculationSteps.deductions.absentPenalty)}</Text>
                    </Row>
                  )}
                  <Divider />
                  <Row justify="space-between">
                    <Text strong>Tổng khấu trừ:</Text>
                    <Text strong style={{ color: '#f5222d', fontSize: '16px' }}>
                      -{formatCurrency(details.salaryCalculationSteps?.deductions?.totalDeductions)}
                    </Text>
                  </Row>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Weekend pay explanation and tax progressive breakdown - redesigned */}
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Card
                size="small"
                title={<Row justify="space-between" align="middle"><Text strong>Thuế TNCN (lũy tiến)</Text><Button type="link" size="small" onClick={() => setTaxOpen(true)}>Xem chi tiết</Button></Row>}
                style={{ height: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Row justify="space-between"><Text>Thu nhập trước thuế:</Text><Text strong>{formatCurrency(details.taxDetails?.incomeBeforeTax)}</Text></Row>
                  <Row justify="space-between"><Text>Giảm trừ bản thân:</Text><Text strong>{formatCurrency(details.taxDetails?.personalDeduction)}</Text></Row>
                  <Row justify="space-between"><Text>Giảm trừ người phụ thuộc:</Text><Text strong>{formatCurrency(details.taxDetails?.dependentDeductions)}</Text></Row>
                  <Row justify="space-between"><Text>Thu nhập chịu thuế:</Text><Text strong>{formatCurrency(details.taxDetails?.taxableIncome)}</Text></Row>
                  <Divider style={{ margin: '8px 0' }} />
                  {details.taxProgressive?.length > 0 ? (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {details.taxProgressive.map((b) => (
                        <Row key={b.idx} justify="space-between" style={{ fontSize: 13 }}>
                          <Text>Bậc {b.idx} ({Math.round((b.rate || 0) * 100)}%): {formatCurrency(b.taxable)}</Text>
                          <Text strong>= {formatCurrency(b.tax)}</Text>
                        </Row>
                      ))}
                    </Space>
                  ) : (
                    <Text type="secondary">Không có dữ liệu thuế chi tiết</Text>
                  )}
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Final Result - redesigned */}
          <Card style={{ borderColor: '#b7eb8f', background: '#f6ffed', marginBottom: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ color: '#389e0d', fontWeight: 600 }}>Lương thực nhận</Text>
              <div style={{ fontWeight: 800, fontSize: 36, color: '#237804', marginTop: 4 }}>
                {formatCurrency(details.salaryCalculationSteps?.netSalary)}
              </div>
              <Text type="secondary">Đây là số tiền nhận sau các khoản khấu trừ theo luật</Text>
            </div>
          </Card>

          {/* Calculation Formulas from TopCV */}
          <Card title={<><CalculatorOutlined /> Công thức tính lương TopCV</>}>
            <div style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '6px' }}>
              {details.calculationFormulas?.map((formula, index) => (
                <Paragraph key={index} code style={{ margin: '4px 0', fontSize: '13px' }}>
                  {formula}
                </Paragraph>
              ))}
            </div>
            <Alert
              message="Nguồn dữ liệu"
              description={
                <div>
                  <strong>✓ Lương cơ bản:</strong> Lấy từ hợp đồng (offer/salary field)<br/>
                  <strong>✓ Giờ làm việc:</strong> Tích hợp với hệ thống chấm công<br/>
                  <strong>✓ Tính thuế TNCN:</strong> TopCV Vietnamese progressive tax system<br/>
                  <strong>✓ Bảo hiểm:</strong> BHXH 8%, BHYT 1.5%, BHTN 1%<br/>
                  <Text type="secondary">Sử dụng TopCV calculation engine với dữ liệu hợp đồng thực tế.</Text>
                </div>
              }
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
            <div style={{ marginTop: 12 }}>
              <Button type="primary" onClick={() => setFormulaOpen(true)}>
                Xem chi tiết cách tính lương
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <Alert
          message="Không thể tải thông tin TopCV"
          description="Không tìm thấy dữ liệu TopCV calculation cho nhân viên này."
          type="error"
          showIcon
        />
      )}
      {/* Popup: Cách tính lương & OT (theo thiết kế tham khảo) */}
      <Modal
        title="Cách tính lương & OT"
        open={formulaOpen}
        onCancel={() => setFormulaOpen(false)}
        footer={[
          <Button key="close" onClick={() => setFormulaOpen(false)}>Đóng</Button>
        ]}
      >
        <div style={{ color: '#6b7280', marginBottom: 12 }}>
          Tiền lương một ngày công được tính bằng cách lấy lương cơ bản chia cho số ngày công chuẩn của tháng.
        </div>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Ngày làm việc bình thường</div>
            <div style={{ color: '#6b7280' }}>Hưởng <span style={{ fontWeight: 700, color: '#2563eb' }}>100%</span> lương.</div>
          </div>
          <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Làm thêm giờ (OT) vào ngày thường</div>
            <div style={{ color: '#6b7280' }}>Hưởng ít nhất <span style={{ fontWeight: 700, color: '#2563eb' }}>150%</span> lương giờ bình thường.</div>
          </div>
          <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Làm việc vào ngày nghỉ cuối tuần</div>
            <div style={{ color: '#6b7280' }}>Hưởng ít nhất <span style={{ fontWeight: 700, color: '#2563eb' }}>200%</span> lương.</div>
          </div>
          <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Làm việc vào ngày Lễ, Tết</div>
            <div style={{ color: '#6b7280' }}>Hưởng ít nhất <span style={{ fontWeight: 700, color: '#2563eb' }}>300%</span> lương (chưa bao gồm lương ngày nghỉ lễ).</div>
          </div>
        </Space>
      </Modal>

      {/* Popup: Tổng thu nhập */}
      <Modal title="Chi tiết tổng thu nhập" open={incomeOpen} onCancel={() => setIncomeOpen(false)} footer={[<Button key="close" onClick={() => setIncomeOpen(false)}>Đóng</Button>]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row justify="space-between"><Text>Lương cơ bản (HĐ):</Text><Text strong>{formatCurrency(details?.salaryCalculationSteps?.step1_BaseSalary)}</Text></Row>
          <Row justify="space-between"><Text>Lương giờ làm thực tế:</Text><Text strong>{formatCurrency(details?.salaryCalculationSteps?.step2_RegularPay)}</Text></Row>
          {details?.salaryCalculationSteps?.step3_OvertimePay > 0 && (
            <Row justify="space-between"><Text>Lương tăng ca:</Text><Text strong>{formatCurrency(details?.salaryCalculationSteps?.step3_OvertimePay)}</Text></Row>
          )}
          {details?.salaryCalculationSteps?.step4_HolidayPay > 0 && (
            <Row justify="space-between"><Text>Lương ngày lễ:</Text><Text strong>{formatCurrency(details?.salaryCalculationSteps?.step4_HolidayPay)}</Text></Row>
          )}
          {details?.salaryCalculationSteps?.step5_WeekendPay > 0 && (
            <Row justify="space-between"><Text>Lương cuối tuần (2x):</Text><Text strong>{formatCurrency(details?.salaryCalculationSteps?.step5_WeekendPay)}</Text></Row>
          )}
          <Divider />
          <Row justify="space-between"><Text strong>Tổng lương gộp:</Text><Text strong>{formatCurrency(details?.salaryCalculationSteps?.grossSalary)}</Text></Row>
        </Space>
      </Modal>

      {/* Popup: Các khoản khấu trừ */}
      <Modal title="Chi tiết các khoản khấu trừ" open={deductionsOpen} onCancel={() => setDeductionsOpen(false)} footer={[<Button key="close" onClick={() => setDeductionsOpen(false)}>Đóng</Button>]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row justify="space-between"><Text>BHXH (8%):</Text><Text strong style={{ color: '#f5222d' }}>{formatCurrency(details?.salaryCalculationSteps?.deductions?.socialInsurance)}</Text></Row>
          <Row justify="space-between"><Text>BHYT (1.5%):</Text><Text strong style={{ color: '#f5222d' }}>{formatCurrency(details?.salaryCalculationSteps?.deductions?.healthInsurance)}</Text></Row>
          <Row justify="space-between"><Text>BHTN (1%):</Text><Text strong style={{ color: '#f5222d' }}>{formatCurrency(details?.salaryCalculationSteps?.deductions?.unemploymentInsurance)}</Text></Row>
          <Row justify="space-between"><Text>Thuế TNCN (lũy tiến):</Text><Text strong style={{ color: '#f5222d' }}>{formatCurrency(details?.salaryCalculationSteps?.deductions?.personalIncomeTax)}</Text></Row>
          <Divider />
          <Row justify="space-between"><Text strong>Tổng khấu trừ:</Text><Text strong style={{ color: '#f5222d' }}>{formatCurrency(details?.salaryCalculationSteps?.deductions?.totalDeductions)}</Text></Row>
        </Space>
      </Modal>

      {/* Popup: Thuế TNCN (lũy tiến) */}
      <Modal title="Chi tiết Thuế TNCN (lũy tiến)" open={taxOpen} onCancel={() => setTaxOpen(false)} footer={[<Button key="close" onClick={() => setTaxOpen(false)}>Đóng</Button>]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row justify="space-between"><Text>Thu nhập trước thuế:</Text><Text strong>{formatCurrency(details?.taxDetails?.incomeBeforeTax)}</Text></Row>
          <Row justify="space-between"><Text>Giảm trừ bản thân:</Text><Text strong>{formatCurrency(details?.taxDetails?.personalDeduction)}</Text></Row>
          <Row justify="space-between"><Text>Giảm trừ người phụ thuộc:</Text><Text strong>{formatCurrency(details?.taxDetails?.dependentDeductions)}</Text></Row>
          <Row justify="space-between"><Text>Thu nhập chịu thuế:</Text><Text strong>{formatCurrency(details?.taxDetails?.taxableIncome)}</Text></Row>
          <Divider />
          {details?.taxProgressive?.length > 0 ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              {details.taxProgressive.map((b) => (
                <Row key={b.idx} justify="space-between" style={{ fontSize: 13 }}>
                  <Text>Bậc {b.idx} ({Math.round((b.rate || 0) * 100)}%): {formatCurrency(b.taxable)}</Text>
                  <Text strong>= {formatCurrency(b.tax)}</Text>
                </Row>
              ))}
            </Space>
          ) : (
            <Text type="secondary">Không có dữ liệu thuế chi tiết</Text>
          )}
        </Space>
      </Modal>
    </Modal>
  );
};

export default SalaryCalculationDetailsModal;