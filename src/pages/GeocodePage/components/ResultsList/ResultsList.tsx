import { Table, List, Button, Modal, Typography, Space, message } from "antd";
import {
  EnvironmentOutlined,
  GlobalOutlined,
  EyeOutlined,
  CopyOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import type { TFunction } from "i18next";
import type { GeocodeResult } from "../../../../types/geocode";
import "./ResultsList.scss";

const { Text, Paragraph } = Typography;

interface IProps {
  results: GeocodeResult[];
  onViewWeather: (lat: number, lon: number) => void;
  t: TFunction;
}

const translateClass = (
  classValue: string | undefined,
  t: TFunction,
): string => {
  if (!classValue) return "—";
  const key = `type_${classValue}`;
  const translated = t(key);
  return translated === key ? classValue : translated;
};

export const ResultsList = ({ results, onViewWeather, t }: IProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<GeocodeResult | null>(
    null,
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isCopied, setIsCopied] = useState(false);
  const [copiedCoordinates, setCopiedCoordinates] = useState("");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleViewDetails = (record: GeocodeResult) => {
    setSelectedResult(record);
    setIsModalOpen(true);
    setIsCopied(false);
    setCopiedCoordinates("");
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsCopied(false);
    setCopiedCoordinates("");
  };
  const handleViewWeather = () => {
    if (selectedResult) {
      onViewWeather(
        parseFloat(selectedResult.lat),
        parseFloat(selectedResult.lon),
      );
      handleCloseModal();
    }
  };
  const handleCopyCoordinates = (lat: number, lon: number) => {
    const coords = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    navigator.clipboard
      .writeText(coords)
      .then(() => {
        setIsCopied(true);
        setCopiedCoordinates(coords);
        message.success(t("copied"));
        setTimeout(() => {
          setIsCopied(false);
          setCopiedCoordinates("");
        }, 3000);
      })
      .catch(() => {
        message.error(t("copy_error") || "Failed to copy");
      });
  };
  const columns = [
    {
      title: t("location"),
      dataIndex: "display_name",
      key: "display_name",
      render: (text: string) => (
        <span>
          <EnvironmentOutlined style={{ marginRight: 8, color: "#1890ff" }} />
          {text}
        </span>
      ),
    },
    {
      title: t("coordinates"),
      key: "coords",
      render: (_: unknown, record: GeocodeResult) => (
        <span>
          {parseFloat(record.lat).toFixed(4)},{" "}
          {parseFloat(record.lon).toFixed(4)}
        </span>
      ),
    },
    {
      title: t("type"),
      dataIndex: "class",
      key: "class",
      render: (text: string) => translateClass(text, t),
    },
    {
      title: t("action"),
      key: "action",
      render: (_: unknown, record: GeocodeResult) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            onViewWeather(parseFloat(record.lat), parseFloat(record.lon));
          }}
        >
          {t("view_weather")}
        </Button>
      ),
    },
  ];

  if (isMobile) {
    return (
      <>
        <List
          className="results-list"
          dataSource={results}
          renderItem={(item) => (
            <List.Item className="mobile-list-item">
              <div className="mobile-item-content">
                <div className="mobile-item-row">
                  <EnvironmentOutlined
                    style={{ fontSize: 24, color: "#1890ff" }}
                  />
                  <div className="mobile-item-title">{item.display_name}</div>
                </div>
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetails(item)}
                  className="mobile-details-btn"
                >
                  {t("details")}
                </Button>
              </div>
            </List.Item>
          )}
        />
        <Modal
          title={
            <Space>
              <GlobalOutlined style={{ color: "#1890ff" }} />
              <span>{t("location_details")}</span>
            </Space>
          }
          open={isModalOpen}
          onCancel={handleCloseModal}
          footer={[
            <Button key="cancel" onClick={handleCloseModal}>
              {t("close")}
            </Button>,
            <Button
              key="weather"
              type="primary"
              onClick={handleViewWeather}
              icon={<EyeOutlined />}
            >
              {t("view_weather")}
            </Button>,
          ]}
          closable={false}
          width={400}
        >
          {selectedResult && (
            <div className="modal-details">
              <div className="modal-row">
                <Text strong>{t("location")}:</Text>
                <Paragraph>{selectedResult.display_name}</Paragraph>
              </div>
              <div className="modal-row">
                <Text strong>{t("coordinates")}:</Text>
                <div className="coords-wrapper">
                  <Text>
                    {parseFloat(selectedResult.lat).toFixed(6)},{" "}
                    {parseFloat(selectedResult.lon).toFixed(6)}
                  </Text>
                  <Button
                    type="text"
                    icon={
                      isCopied &&
                      copiedCoordinates ===
                        `${parseFloat(selectedResult.lat).toFixed(4)}, ${parseFloat(
                          selectedResult.lon,
                        ).toFixed(4)}` ? (
                        <CheckOutlined style={{ color: "#52c41a" }} />
                      ) : (
                        <CopyOutlined />
                      )
                    }
                    onClick={() =>
                      handleCopyCoordinates(
                        parseFloat(selectedResult.lat),
                        parseFloat(selectedResult.lon),
                      )
                    }
                    className="copy-btn"
                    title={t("copy_coords")}
                  />
                </div>
              </div>
              <div className="modal-row">
                <Text strong>{t("type")}:</Text>
                <Text>{translateClass(selectedResult.class, t)}</Text>
              </div>
              {selectedResult.address && (
                <div className="modal-row">
                  <Text strong>{t("address")}:</Text>
                  <Paragraph>
                    {selectedResult.address.city ||
                      selectedResult.address.town ||
                      selectedResult.address.village ||
                      "—"}
                    {selectedResult.address.state &&
                      `, ${selectedResult.address.state}`}
                    {selectedResult.address.country &&
                      `, ${selectedResult.address.country}`}
                  </Paragraph>
                </div>
              )}
            </div>
          )}
        </Modal>
      </>
    );
  }

  return (
    <Table
      dataSource={results}
      columns={columns}
      rowKey="place_id"
      pagination={{ pageSize: 5 }}
      scroll={{ x: true }}
    />
  );
};
