Item {
	anchors.fill: parent

	Column {
		id: headerColumn
		y: 10
		width: parent.width - 20
		spacing: 0
		Text {
			color: theme.primarytextcolor
			text: "First Version of Tuya Razer Connect."
			font.pixelSize: 16
			font.family: "Poppins"
			font.bold: false
			bottomPadding: 10
			width: parent.width
			wrapMode: Text.WordWrap
		}
    }

	ListView {
		id: controllerList
		model: service.controllers
		width: parent.width
		height: parent.height - (headerColumn.height + 20) - 50
		y: headerColumn.height + 20
		clip: true
		spacing: 20

		ScrollBar.vertical: ScrollBar {
			id: controllerListScrollBar
			anchors.right: parent.right
			width: 10
			visible: true //parent.height < parent.contentHeight
			policy: ScrollBar.AlwaysOn
			height: parent.availableHeight
			contentItem: Rectangle {
				radius: parent.width / 2
				color: theme.scrollBar
			}
		}

		delegate:
		Item {
			id: root
			width: 520
			height: content.height

			property var controller: model.modelData.obj

			Rectangle {
				width: parent.width
				height: parent.height
				color: Qt.lighter(theme.background2, 1.3)
				radius: 2
			}

			Column {
				id: content
				width: parent.width
				padding: 15

				Row {
					Switch {
						id: enabled
						text: qsTr("Enabled")
						leftPadding: 380
						position: controller.enabled
						onClicked: {
							updateButton.enabled = controller.validateDeviceUpdate(enabled.checked, deviceType.currentValue, localKey.text);
						}
					}
				}

				Row {
					width: parent.width
					spacing: 10

					Text {
						width: parent.width - 60
						color: theme.primarytextcolor
						text: controller.name
						font.pixelSize: 18
						font.family: "Poppins"
						font.weight: Font.Bold
					}
				}

				Row {
					width: parent.width

					Text {
						color: theme.primarytextcolor
						text: "IP: " + controller.ip
						font.pixelSize: 14
						font.family: "Poppins"
					}
				}

				Row {
					width: parent.width

					Text {
						color: theme.primarytextcolor
						text: "Version: " + controller.version
						font.pixelSize: 14
						font.family: "Poppins"
					}
				}

				Row {
					width: parent.width

					Text {
						color: theme.primarytextcolor
						text: "Product key: " + controller.productKey
						font.pixelSize: 14
						font.family: "Poppins"
					}
				}

				Row {
					width: parent.width

					Text {
						color: theme.primarytextcolor
						text: "Product UUID: " + controller.uuid
						font.pixelSize: 14
						font.family: "Poppins"
					}
				}

				Row {
					width: parent.width

					Text {
						color: theme.primarytextcolor
						text: "Product gwId: " + controller.gwId
						font.pixelSize: 14
						font.family: "Poppins"
						bottomPadding: 15
					}
				}

				Row {
					width: parent.width

					Text {
						color: theme.primarytextcolor
						text: "Device type"
						font.pixelSize: 14
						font.family: "Poppins"
						bottomPadding: 10
					}
				}

				Row {
					width: parent.width
					bottomPadding: 15

					Rectangle {
						width: parent.width - 30
						height: 30
						radius: 2
						border.color: "#444444"
						border.width: 2
						color: "#141414"

						ComboBox {
							y: 0
							id: deviceType
							width: parent.width
							height: 30
							font.family: "Poppins"
							font.bold: true
							flat: true
							model: controller.deviceList
							textRole: "deviceName"
							valueRole: "key"
							topInset: 0
							bottomInset: 0
							verticalPadding: 0
							Component.onCompleted: currentIndex = indexOfValue(controller.deviceType)
							
							onActivated: {
								updateButton.enabled = controller.validateDeviceUpdate(enabled.checked, deviceType.currentValue, localKey.text);
							}
						}
					}
				}

				Row {
					width: parent.width

					Text {
						color: theme.primarytextcolor
						text: "Device local key"
						font.pixelSize: 14
						font.family: "Poppins"
						bottomPadding: 10
					}
				}

				Row {
					width: parent.width
					bottomPadding: 15

					Rectangle {
						x: 0
						y: 0
						width: parent.width - 30
						height: 30
						radius: 2
						border.color: "#444444"
						border.width: 2
						color: "#141414"
						
						TextField {
							width: parent.width
							leftPadding: 0
							rightPadding: 10
							id: localKey
							x: 10
							y: -5
							color: theme.primarytextcolor
							font.family: "Poppins"
							font.bold: true
							font.pixelSize: 16
							verticalAlignment: TextInput.AlignVCenter
							placeholderText: ""
							text: controller.localKey
							visible: true
							
							background: Item {
								width: parent.width
								height: parent.height
								Rectangle {
									color: "transparent"
									height: 1
									width: parent.width
									anchors.bottom: parent.bottom
								}
							}
							onTextEdited: {
								// service.log(service);
								updateButton.enabled = controller.validateDeviceUpdate(enabled.checked, deviceType.currentValue, localKey.text);
							}
						}
					}
					
				}

				Row {
					width: parent.width
					topPadding: 15
					spacing: 10

					Item {
						Rectangle {
							width: 100
							height: 30
							color: "#003000"
							radius: 2
						}
						width: 100
						height: 30
						ToolButton {
							id: updateButton
							enabled: false
							height: 30
							width: 100
							anchors.verticalCenter: parent.verticalCenter
							font.family: "Poppins"
							font.bold: true
							icon.source: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA6ElEQVQ4jZWTaxGDMBCEN3GABSxgAQtYoBKoBCzEQmoFJIAEcLDXH73QlB4MZCYzN5Psl71HgJMlZClkeXbHElVCRiEXIUX3ImQQssjAwRJ3mWhSUNQ4gdoM3lviScjagLc7V7K5UNtJXJzUY9HdJIDX8wLACODhvF8tMYBB780AmluFVUi/sy9CBncTsm/p6jTnn7yd9/MdajCsxat6n8UvfAoJAPXRBApZCzlsrc4cNFmbqgNxkQ1VtXcQ8a3FH0BfHACUAJ7O+zEdpAlcNE7TZo2yCNlZ1vqUk9oMxmeKR6kdrivf+Q3AUXasRZoSOwAAAABJRU5ErkJggg=="
							text: "Update"
							anchors.right: parent.center
							onClicked: {
								if (this.enabled) // dunno if this is needed btw
								{
									controller.updateDevice(enabled.checked, deviceType.currentValue, localKey.text);
									updateButton.enabled = false;
								}
							}
						}
					}
				}
			}
		}  
	}
}
