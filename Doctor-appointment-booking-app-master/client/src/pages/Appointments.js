import { Button, Modal, Popconfirm, Table } from "antd";
import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import Layout from "../components/Layout";
import { hideLoading, showLoading } from "../redux/alertsSlice";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch();
  const getAppointmentsData = async () => {
    try {
      dispatch(showLoading());
      const resposne = await axios.get("/api/user/get-appointments-by-user-id", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      dispatch(hideLoading());
      if (resposne.data.success) {
        setAppointments(resposne.data.data);
      }
    } catch (error) {
      dispatch(hideLoading());
    }
  };
  const handleRowClick = (record) => {
    setSelectedAppointment(record);
    setModalVisible(true);
  };
  const handleCancelAppointment = async (appointmentId) => {
    try {
      dispatch(showLoading());
      const response = await axios.delete(`/api/user/cancel-appointment/${appointmentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success("Appointment cancelled successfully");
        getAppointmentsData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Error cancelling appointment");
    }
  };
  const closeModal = () => {
    setSelectedAppointment(null);
    setModalVisible(false);
  };
  const columns = [
    {
      title: "Id",
      dataIndex: "_id",
    },
    {
      title: "Doctor",
      dataIndex: "name",
      render: (text, record) => (
        <span>
          {record.doctorInfo.firstName} {record.doctorInfo.lastName}
        </span>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      render: (text, record) => (
        <span>
          {record.doctorInfo.phoneNumber}
        </span>
      ),
    },
    {
      title: "Date & Time",
      dataIndex: "createdAt",
      render: (text, record) => (
        <span>
          {moment(record.date).format("DD-MM-YYYY")} {moment(record.time).format("HH:mm")}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Action",
      render: (text, record) => (
        <Popconfirm
          title="Are you sure to cancel this appointment?"
          onConfirm={() => handleCancelAppointment(record._id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="danger">Cancel</Button>
        </Popconfirm>
      ),
    },
  ];
  useEffect(() => {
    getAppointmentsData();
  }, []);

  return <Layout>
    <h1 className="page-title">Appointments</h1>
    <hr />
    <Table
      columns={columns}
      dataSource={appointments}
      rowKey="_id"
      onRow={(record) => ({
        onClick: () => handleRowClick(record),
      })}
    />
    <Modal
      title="Appointment Details"
      visible={modalVisible}
      onCancel={closeModal}
      footer={[
        <Button key="close" onClick={closeModal}>
          Close
        </Button>,
      ]}
    >
      {selectedAppointment && (
        <div>
          <p><strong>ID:</strong> {selectedAppointment._id}</p>
          <p><strong>Doctor:</strong> {selectedAppointment.doctorInfo.firstName} {selectedAppointment.doctorInfo.lastName}</p>
          <p><strong>Phone:</strong> {selectedAppointment.doctorInfo.phoneNumber}</p>
          <p><strong>Date & Time:</strong> {moment(selectedAppointment.date).format("DD-MM-YYYY")} {moment(selectedAppointment.time).format("HH:mm")}</p>
          <p><strong>Status:</strong> {selectedAppointment.status}</p>
          {/* Render other appointment details as needed */}
        </div>
      )}
    </Modal>
  </Layout>
}

export default Appointments;
